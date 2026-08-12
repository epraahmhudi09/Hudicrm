import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { Timestamp } from "firebase-admin/firestore";
import { db, messaging } from "./lib/firebaseAdmin";

const ALERT_AFTER_MS = 24 * 60 * 60 * 1000;

/**
 * Runs hourly. Finds customers whose bundle expired 24+ hours ago and
 * haven't been renewed since (bundleExpiry hasn't changed since the last
 * alert), and pushes a notification to every staff member's registered
 * device. `lastExpiryAlertSentFor` is stamped with the bundleExpiry value
 * an alert was sent for, so editing an unrelated field doesn't re-trigger
 * it, but an actual renewal (new bundleExpiry) naturally re-arms it.
 */
export const checkExpiredBundles = onSchedule(
  { schedule: "every 60 minutes", timeZone: "Africa/Mogadishu" },
  async () => {
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
      logger.info("checkExpiredBundles: nothing due");
      return;
    }

    const tokens = usersSnap.docs
      .map((doc) => doc.data().fcmToken as string | undefined)
      .filter((token): token is string => Boolean(token));

    for (const doc of dueForAlert) {
      const data = doc.data();
      const name = String(data.name ?? "Customer");

      if (tokens.length > 0) {
        const response = await messaging.sendEachForMulticast({
          tokens,
          notification: {
            title: "Bundle expired 24h+ ago",
            body: `${name}'s bundle expired more than 24 hours ago and hasn't been renewed.`,
          },
          webpush: {
            fcmOptions: { link: "/" },
          },
        });
        logger.info("checkExpiredBundles: notified", {
          customerId: doc.id,
          successCount: response.successCount,
          failureCount: response.failureCount,
        });
      }

      await doc.ref.update({ lastExpiryAlertSentFor: data.bundleExpiry });
    }
  }
);
