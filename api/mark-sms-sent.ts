import { updateFields } from "./lib/firestoreRest.js";
import type { VercelRequest, VercelResponse } from "./lib/types.js";

/**
 * Called by the Termux phone's sender loop right after termux-sms-send
 * successfully hands a queued reminder to the SIM, so it isn't sent again
 * on the next poll.
 *
 *   POST https://<your-vercel-domain>/api/mark-sms-sent?token=<SMS_WEBHOOK_SECRET>
 *   Body: {"id": "<outboundSms doc id>"}
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ ok: false, error: "method_not_allowed" });
      return;
    }

    const expectedToken = process.env.SMS_WEBHOOK_SECRET;
    const providedToken =
      (req.query.token as string | undefined) ?? (req.headers["x-webhook-token"] as string | undefined);

    if (!expectedToken || providedToken !== expectedToken) {
      res.status(401).json({ ok: false, error: "unauthorized" });
      return;
    }

    const id = (req.body as { id?: unknown } | undefined)?.id;
    if (typeof id !== "string" || !id) {
      res.status(400).json({ ok: false, error: "missing_id" });
      return;
    }

    await updateFields(`outboundSms/${id}`, { sentAt: new Date() });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("mark-sms-sent error:", err);
    res.status(500).json({ ok: false, error: "internal_error", message: (err as Error).message });
  }
}
