import { listCollection } from "./lib/firestoreRest.js";
import type { VercelRequest, VercelResponse } from "./lib/types.js";

/**
 * Polled by the Termux phone's sender loop to find customer reminder SMS
 * that check-expiry has queued but nothing has sent yet. Returns the raw
 * queue rather than mutating anything — the Termux script marks each one
 * sent (via /api/mark-sms-sent) only after termux-sms-send actually
 * succeeds, so a crash mid-send just gets retried next poll instead of
 * silently dropping the reminder.
 *
 *   https://<your-vercel-domain>/api/pending-sms?token=<SMS_WEBHOOK_SECRET>
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expectedToken = process.env.SMS_WEBHOOK_SECRET;
    const providedToken =
      (req.query.token as string | undefined) ?? (req.headers["x-webhook-token"] as string | undefined);

    if (!expectedToken || providedToken !== expectedToken) {
      res.status(401).json({ ok: false, error: "unauthorized" });
      return;
    }

    const docs = await listCollection("outboundSms");
    const pending = docs
      .filter((doc) => !doc.sentAt)
      .map((doc) => ({
        id: doc.id,
        phone: String(doc.phone ?? ""),
        message: String(doc.message ?? ""),
      }))
      .filter((doc) => doc.phone && doc.message);

    res.status(200).json({ ok: true, pending });
  } catch (err) {
    console.error("pending-sms error:", err);
    res.status(500).json({ ok: false, error: "internal_error", message: (err as Error).message });
  }
}
