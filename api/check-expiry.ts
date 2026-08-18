import {
  addDocument,
  listCollection,
  queryEqual,
  queryEqualWithRange,
  updateFields,
  type FirestoreDoc,
} from "./_lib/firestoreRest.js";
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
 * Every overdue customer for this tenant (bundleExpiry <= alertCutoff — the
 * 48h escalation cutoff is a subset of this, so one query covers both).
 * Tries the indexed tenantId+bundleExpiry query first, which costs one read
 * per *overdue* customer instead of one per customer total — the difference
 * that lets this run on a tight schedule without burning through the daily
 * quota. Firestore rejects that query until its composite index has been
 * created (Firebase Console -> Firestore -> Indexes), so until then — or if
 * it's ever removed — this falls back to the full per-tenant scan, which is
 * slower but always correct.
 */
async function loadOverdueCustomers(tenantId: string, alertCutoff: number): Promise<FirestoreDoc[]> {
  try {
    return await queryEqualWithRange(
      "customers",
      { tenantId },
      { fieldPath: "bundleExpiry", lessThanOrEqual: new Date(alertCutoff) }
    );
  } catch (err) {
    console.error("check-expiry: composite query unavailable, falling back to full scan:", err);
    const all = await queryEqual("customers", { tenantId });
    return all.filter((doc) => {
      const bundleExpiry = doc.bundleExpiry as Date | null;
      return bundleExpiry && bundleExpiry.getTime() <= alertCutoff;
    });
  }
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

    // Tenants list stays a full scan (handful of docs, cheap); customers and
    // users are queried per-tenant (see loadOverdueCustomers above) instead
    // of scanning those collections in full.
    const allTenants = await listCollection("tenants");

    const results = [];

    for (const tenant of allTenants) {
      if (tenant.active === false) continue;

      const [expired, tenantUsers] = await Promise.all([
        loadOverdueCustomers(tenant.id, alertCutoff),
        queryEqual("users", { tenantId: tenant.id }),
      ]);
      const tokens = tenantUsers
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
