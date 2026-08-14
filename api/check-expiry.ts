import { addDocument, listCollection, queryLessThanOrEqual, updateFields } from "./lib/firestoreRest.js";
import { sendPushToTokens } from "./lib/fcmRest.js";
import type { VercelRequest, VercelResponse } from "./lib/types.js";

const ALERT_AFTER_MS = 24 * 60 * 60 * 1000;
const ESCALATION_AFTER_MS = 48 * 60 * 60 * 1000;

function customerSmsText(name: string): string {
  const supportPhone = process.env.SUPPORT_CONTACT_PHONE ?? "";
  const contactSuffix = supportPhone ? ` Laxariir = ${supportPhone}` : "";
  return `${name} Waykaa dhacday Xirmadii Internate ka ahayd ee Kuugu Jirtay Fadlan Si aad U cusboonaysiiso${contactSuffix}`;
}

/**
 * Meant to be hit on a schedule (e.g. every 30 min) by a free external cron
 * service such as cron-job.org, since Vercel Hobby's own cron jobs are
 * capped at daily. Two independent thresholds, both keyed off the same
 * bundleExpiry so a renewal naturally re-arms both:
 *  - 24h+ overdue: pushes a staff notification, and queues a reminder SMS
 *    to the customer (sent by the Termux phone polling /api/pending-sms).
 *  - 48h+ overdue: pushes a separate, more urgent staff notification asking
 *    someone to personally call the customer.
 *
 *   https://<your-vercel-domain>/api/check-expiry?token=<CRON_SECRET>
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expectedToken = process.env.CRON_SECRET;
    const providedToken =
      (req.query.token as string | undefined) ?? (req.headers["x-cron-token"] as string | undefined);

    if (!expectedToken || providedToken !== expectedToken) {
      res.status(401).json({ ok: false, error: "unauthorized" });
      return;
    }

    const now = Date.now();
    const alertCutoff = new Date(now - ALERT_AFTER_MS);
    const escalationCutoff = new Date(now - ESCALATION_AFTER_MS);

    const [expired, users] = await Promise.all([
      queryLessThanOrEqual("customers", "bundleExpiry", alertCutoff),
      listCollection("users"),
    ]);

    const tokens = users
      .map((u) => u.fcmToken as string | undefined)
      .filter((t): t is string => Boolean(t));

    const dueForAlert = expired.filter((doc) => {
      const bundleExpiry = doc.bundleExpiry as Date | null;
      const lastAlertedFor = doc.lastExpiryAlertSentFor as Date | null | undefined;
      if (!bundleExpiry) return false;
      return !lastAlertedFor || lastAlertedFor.getTime() !== bundleExpiry.getTime();
    });

    const dueForEscalation = expired.filter((doc) => {
      const bundleExpiry = doc.bundleExpiry as Date | null;
      const lastEscalatedFor = doc.last48hEscalationSentFor as Date | null | undefined;
      if (!bundleExpiry || bundleExpiry.getTime() > escalationCutoff.getTime()) return false;
      return !lastEscalatedFor || lastEscalatedFor.getTime() !== bundleExpiry.getTime();
    });

    let notified = 0;
    let pushErrors: string[] = [];
    let smsQueued = 0;

    if (dueForAlert.length > 0) {
      // One combined notification listing who's overdue, instead of a
      // separate push per customer — much more useful when several lapse
      // around the same time (staff see the whole picture in one glance
      // instead of a flood of near-identical notifications).
      const names = dueForAlert.map((doc) => String(doc.name ?? "Customer"));
      const namesPreview =
        names.length <= 3 ? names.join(", ") : `${names.slice(0, 3).join(", ")} +${names.length - 3} more`;

      if (tokens.length > 0) {
        const result = await sendPushToTokens(tokens, {
          title: `${dueForAlert.length} bundle${dueForAlert.length === 1 ? "" : "s"} expired 24h+ ago`,
          body: `${namesPreview} — please follow up.`,
        });
        if (result.successCount > 0) notified = dueForAlert.length;
        pushErrors = result.errors;
      }

      for (const doc of dueForAlert) {
        const mainPhone = String(doc.mainPhone ?? "").trim();
        if (mainPhone) {
          await addDocument("outboundSms", {
            phone: mainPhone,
            message: customerSmsText(String(doc.name ?? "Customer")),
            customerId: doc.id,
            createdAt: new Date(),
            sentAt: null,
          });
          smsQueued++;
        }
        await updateFields(`customers/${doc.id}`, { lastExpiryAlertSentFor: doc.bundleExpiry as Date });
      }
    }

    let escalated = 0;
    if (dueForEscalation.length > 0) {
      const names = dueForEscalation.map((doc) => String(doc.name ?? "Customer"));
      const namesPreview =
        names.length <= 3 ? names.join(", ") : `${names.slice(0, 3).join(", ")} +${names.length - 3} more`;

      if (tokens.length > 0) {
        const result = await sendPushToTokens(tokens, {
          title: `\u{1F6A8} ${dueForEscalation.length} customer${dueForEscalation.length === 1 ? "" : "s"} 48h+ overdue — call needed`,
          body: `${namesPreview} — please call them directly.`,
        });
        if (result.successCount > 0) escalated = dueForEscalation.length;
      }

      for (const doc of dueForEscalation) {
        await updateFields(`customers/${doc.id}`, {
          last48hEscalationSentFor: doc.bundleExpiry as Date,
        });
      }
    }

    res.status(200).json({
      ok: true,
      checked: dueForAlert.length,
      notified,
      smsQueued,
      escalationChecked: dueForEscalation.length,
      escalated,
      tokensRegistered: tokens.length,
      pushErrors,
    });
  } catch (err) {
    console.error("check-expiry error:", err);
    res.status(500).json({ ok: false, error: "internal_error", message: (err as Error).message });
  }
}
