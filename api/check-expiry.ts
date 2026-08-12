import { listCollection, queryLessThanOrEqual, updateFields } from "./lib/firestoreRest.js";
import { sendPushToTokens } from "./lib/fcmRest.js";
import type { VercelRequest, VercelResponse } from "./lib/types.js";

const ALERT_AFTER_MS = 24 * 60 * 60 * 1000;

/**
 * Meant to be hit on a schedule (e.g. hourly) by a free external cron
 * service such as cron-job.org, since Vercel Hobby's own cron jobs are
 * capped at daily. Finds customers whose bundle expired 24+ hours ago and
 * haven't been renewed since (bundleExpiry hasn't changed since the last
 * alert), and pushes a notification to every staff member's registered
 * device.
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

    const cutoff = new Date(Date.now() - ALERT_AFTER_MS);

    const [expired, users] = await Promise.all([
      queryLessThanOrEqual("customers", "bundleExpiry", cutoff),
      listCollection("users"),
    ]);

    const dueForAlert = expired.filter((doc) => {
      const bundleExpiry = doc.bundleExpiry as Date | null;
      const lastAlertedFor = doc.lastExpiryAlertSentFor as Date | null | undefined;
      if (!bundleExpiry) return false;
      return !lastAlertedFor || lastAlertedFor.getTime() !== bundleExpiry.getTime();
    });

    if (dueForAlert.length === 0) {
      res.status(200).json({ ok: true, checked: 0, notified: 0 });
      return;
    }

    const tokens = users
      .map((u) => u.fcmToken as string | undefined)
      .filter((t): t is string => Boolean(t));

    let notified = 0;
    for (const doc of dueForAlert) {
      const name = String(doc.name ?? "Customer");

      if (tokens.length > 0) {
        const result = await sendPushToTokens(tokens, {
          title: "Bundle expired 24h+ ago",
          body: `${name}'s bundle expired more than 24 hours ago and hasn't been renewed.`,
        });
        if (result.successCount > 0) notified++;
      }

      await updateFields(`customers/${doc.id}`, { lastExpiryAlertSentFor: doc.bundleExpiry as Date });
    }

    res.status(200).json({ ok: true, checked: dueForAlert.length, notified });
  } catch (err) {
    console.error("check-expiry error:", err);
    res.status(500).json({ ok: false, error: "internal_error", message: (err as Error).message });
  }
}
