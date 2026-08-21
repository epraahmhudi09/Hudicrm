import { queryEqual, queryEqualAndIsNull, type FirestoreDoc } from "./_lib/firestoreRest.js";
import type { VercelRequest, VercelResponse } from "./_lib/types.js";

/**
 * Unsent outboundSms for this tenant. outboundSms never gets pruned — a
 * doc sticks around forever once sent — so a plain tenantId scan (the old
 * behavior) grows more expensive every day as history piles up, on a
 * collection polled every minute. Tries the indexed tenantId+sentAt(null)
 * query first; falls back to the full scan if Firestore hasn't been given
 * a composite index for it (or ever loses one).
 */
async function loadUnsentOutboundSms(tenantId: string): Promise<FirestoreDoc[]> {
  try {
    return await queryEqualAndIsNull("outboundSms", { tenantId }, "sentAt");
  } catch (err) {
    console.error("pending-sms: indexed query unavailable, falling back to full scan:", err);
    const all = await queryEqual("outboundSms", { tenantId });
    return all.filter((doc) => !doc.sentAt);
  }
}

/**
 * Polled by a tenant's Termux phone to find customer reminder SMS that
 * check-expiry has queued but nothing has sent yet, scoped to whichever
 * tenant owns the given webhook token. Returns the raw queue rather than
 * mutating anything — the Termux script marks each one sent (via
 * /api/mark-sms-sent) only after termux-sms-send actually succeeds, so a
 * crash mid-send just gets retried next poll instead of silently dropping
 * the reminder.
 *
 *   https://<your-vercel-domain>/api/pending-sms?token=<tenant's webhookToken>
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const providedToken =
      (req.query.token as string | undefined) ?? (req.headers["x-webhook-token"] as string | undefined);

    const tenantMatches = providedToken
      ? await queryEqual("tenants", { webhookToken: providedToken })
      : [];
    const tenant = tenantMatches.find((t) => t.active !== false);

    if (!tenant) {
      res.status(401).json({ ok: false, error: "unauthorized" });
      return;
    }

    const docs = await loadUnsentOutboundSms(tenant.id);
    const pending = docs
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
