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

    const tokens = users
      .map((u) => u.fcmToken as string | undefined)
      .filter((t): t is string => Boolean(t));

    const dueForAlert = expired.filter((doc) => {
      const bundleExpiry = doc.bundleExpiry as Date | null;
      const lastAlertedFor = doc.lastExpiryAlertSentFor as Date | null | undefined;
      if (!bundleExpiry) return false;
      return !lastAlertedFor || lastAlertedFor.getTime() !== bundleExpiry.getTime();
    });

    if (dueForAlert.length === 0) {
      res.status(200).json({ ok: true, checked: 0, notified: 0, tokensRegistered: tokens.length });
      return;
    }

    // One combined notification listing who's overdue, instead of a
    // separate push per customer — much more useful when several lapse
    // around the same time (staff see the whole picture in one glance
    // instead of a flood of near-identical notifications).
    const names = dueForAlert.map((doc) => String(doc.name ?? "Customer"));
    const namesPreview =
      names.length <= 3 ? names.join(", ") : `${names.slice(0, 3).join(", ")} +${names.length - 3} more`;

    let notified = 0;
    let pushErrors: string[] = [];
    if (tokens.length > 0) {
      const result = await sendPushToTokens(tokens, {
        title: `${dueForAlert.length} bundle${dueForAlert.length === 1 ? "" : "s"} expired 24h+ ago`,
        body: `${namesPreview} — please follow up.`,
      });
      if (result.successCount > 0) notified = dueForAlert.length;
      pushErrors = result.errors;
    }

    for (const doc of dueForAlert) {
      await updateFields(`customers/${doc.id}`, { lastExpiryAlertSentFor: doc.bundleExpiry as Date });
    }

    res.status(200).json({
      ok: true,
      checked: dueForAlert.length,
      notified,
      tokensRegistered: tokens.length,
      pushErrors,
    });
  } catch (err) {
    console.error("check-expiry error:", err);
    res.status(500).json({ ok: false, error: "internal_error", message: (err as Error).message });
  }
}
