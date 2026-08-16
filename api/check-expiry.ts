import { addDocument, listCollection, updateFields } from "./_lib/firestoreRest.js";
import { sendPushToTokens } from "./_lib/fcmRest.js";
import type { VercelRequest, VercelResponse } from "./_lib/types.js";

const ALERT_AFTER_MS = 24 * 60 * 60 * 1000;
const ESCALATION_AFTER_MS = 48 * 60 * 60 * 1000;

function customerSmsText(name: string, supportPhone: string, supportPhoneBackup: string): string {
  const phones = [supportPhone, supportPhoneBackup].filter((p) => p.trim()).join("/");
  const contactSuffix = phones ? ` Laxiriir = ${phones}` : "";
  return `Macmiil ${name} Waykaa dhacday Xirmadii Internate ka Ahayd ee Kuugu Jirtay Fadlan Si aad U cusboonaysiiso${contactSuffix}`;
}

/**
 * Meant to be hit on a schedule (e.g. every 30 min) by a free external cron
 * service such as cron-job.org, since Vercel Hobby's own cron jobs are
 * capped at daily. One shared CRON_SECRET triggers this for every tenant in
 * one call — cron-job.org doesn't need a separate job per tenant. For each
 * active tenant, two independent thresholds, both keyed off the same
 * bundleExpiry so a renewal naturally re-arms both:
 *  - 24h+ overdue: pushes a staff notification to that tenant's own users,
 *    and queues a reminder SMS to the customer (sent by that tenant's
 *    Termux phone polling /api/pending-sms).
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
    const alertCutoff = now - ALERT_AFTER_MS;
    const escalationCutoff = now - ESCALATION_AFTER_MS;

    // Fetched once and grouped in memory rather than queried per-tenant —
    // a tenantId-equality + bundleExpiry-range compound query would need a
    // composite index, which isn't provisionable here, and these
    // collections are small enough that a full scan per run is fine.
    const [allTenants, allCustomers, allUsers] = await Promise.all([
      listCollection("tenants"),
      listCollection("customers"),
      listCollection("users"),
    ]);

    const results = [];

    for (const tenant of allTenants) {
      if (tenant.active === false) continue;

      const customers = allCustomers.filter((c) => c.tenantId === tenant.id);
      const tokens = allUsers
        .filter((u) => u.tenantId === tenant.id)
        .map((u) => u.fcmToken as string | undefined)
        .filter((t): t is string => Boolean(t));

      const expired = customers.filter((doc) => {
        const bundleExpiry = doc.bundleExpiry as Date | null;
        return bundleExpiry && bundleExpiry.getTime() <= alertCutoff;
      });

      const dueForAlert = expired.filter((doc) => {
        const bundleExpiry = doc.bundleExpiry as Date | null;
        const lastAlertedFor = doc.lastExpiryAlertSentFor as Date | null | undefined;
        if (!bundleExpiry) return false;
        return !lastAlertedFor || lastAlertedFor.getTime() !== bundleExpiry.getTime();
      });

      const dueForEscalation = expired.filter((doc) => {
        const bundleExpiry = doc.bundleExpiry as Date | null;
        const lastEscalatedFor = doc.last48hEscalationSentFor as Date | null | undefined;
        if (!bundleExpiry || bundleExpiry.getTime() > escalationCutoff) return false;
        return !lastEscalatedFor || lastEscalatedFor.getTime() !== bundleExpiry.getTime();
      });

      let notified = 0;
      let smsQueued = 0;
      const pushErrors: string[] = [];

      if (dueForAlert.length > 0) {
        // One combined notification listing who's overdue, instead of a
        // separate push per customer.
        const names = dueForAlert.map((doc) => String(doc.name ?? "Customer"));
        const namesPreview =
          names.length <= 3 ? names.join(", ") : `${names.slice(0, 3).join(", ")} +${names.length - 3} more`;

        if (tokens.length > 0) {
          const result = await sendPushToTokens(tokens, {
            title: `${dueForAlert.length} bundle${dueForAlert.length === 1 ? "" : "s"} expired 24h+ ago`,
            body: `${namesPreview} — please follow up.`,
          });
          if (result.successCount > 0) notified = dueForAlert.length;
          pushErrors.push(...result.errors);
        }

        const supportPhone = String(tenant.supportPhone ?? "");
        const supportPhoneBackup = String(tenant.supportPhoneBackup ?? "");
        for (const doc of dueForAlert) {
          const mainPhone = String(doc.mainPhone ?? "").trim();
          if (mainPhone) {
            await addDocument("outboundSms", {
              tenantId: tenant.id,
              phone: mainPhone,
              message: customerSmsText(String(doc.name ?? "Customer"), supportPhone, supportPhoneBackup),
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

      results.push({
        tenantId: tenant.id,
        checked: dueForAlert.length,
        notified,
        smsQueued,
        escalationChecked: dueForEscalation.length,
        escalated,
        tokensRegistered: tokens.length,
        pushErrors,
      });
    }

    res.status(200).json({ ok: true, tenants: results });
  } catch (err) {
    console.error("check-expiry error:", err);
    res.status(500).json({ ok: false, error: "internal_error", message: (err as Error).message });
  }
}
