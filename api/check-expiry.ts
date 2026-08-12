import { Timestamp } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { getAdminApp, getDb } from "./_lib/firebaseAdmin";
import type { VercelRequest, VercelResponse } from "./_lib/types";

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

    const db = getDb();
    const messaging = getMessaging(getAdminApp());
    const cutoff = Timestamp.fromMillis(Date.now() - ALERT_AFTER_MS);

    const [expiredSnap, usersSnap] = await Promise.all([
      db.collection("customers").where("bundleExpiry", "<=", cutoff).get(),
      db.collection("users").get(),
    ]);

    const dueForAlert = expiredSnap.docs.filter((doc) => {
      const data = doc.data();
      const bundleExpiry = data.bundleExpiry as Timestamp | null;
      const lastAlertedFor = data.lastExpiryAlertSentFor as Timestamp | null | undefined;
      if (!bundleExpiry) return false;
      return !lastAlertedFor || !lastAlertedFor.isEqual(bundleExpiry);
    });

    if (dueForAlert.length === 0) {
      res.status(200).json({ ok: true, checked: 0, notified: 0 });
      return;
    }

    const tokens = usersSnap.docs
      .map((doc) => doc.data().fcmToken as string | undefined)
      .filter((token): token is string => Boolean(token));

    let notified = 0;
    for (const doc of dueForAlert) {
      const data = doc.data();
      const name = String(data.name ?? "Customer");

      if (tokens.length > 0) {
        await messaging.sendEachForMulticast({
          tokens,
          notification: {
            title: "Bundle expired 24h+ ago",
            body: `${name}'s bundle expired more than 24 hours ago and hasn't been renewed.`,
          },
          webpush: { fcmOptions: { link: "/" } },
        });
        notified++;
      }

      await doc.ref.update({ lastExpiryAlertSentFor: data.bundleExpiry });
    }

    res.status(200).json({ ok: true, checked: dueForAlert.length, notified });
  } catch (err) {
    console.error("check-expiry error:", err);
    res.status(500).json({ ok: false, error: "internal_error", message: (err as Error).message });
  }
}
