import { getDocument, listCollection, updateFields } from "./_lib/firestoreRest.js";
import type { VercelRequest, VercelResponse } from "./_lib/types.js";

/**
 * Called by a tenant's Termux phone right after termux-sms-send successfully
 * hands a queued reminder to the SIM, so it isn't sent again on the next
 * poll. Verifies the doc actually belongs to the tenant that owns the given
 * token before marking it, so a leaked token can't be used to tamper with
 * another tenant's queue.
 *
 *   POST https://<your-vercel-domain>/api/mark-sms-sent?token=<tenant's webhookToken>
 *   Body: {"id": "<outboundSms doc id>"}
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ ok: false, error: "method_not_allowed" });
      return;
    }

    const providedToken =
      (req.query.token as string | undefined) ?? (req.headers["x-webhook-token"] as string | undefined);

    const tenants = await listCollection("tenants");
    const tenant = providedToken
      ? tenants.find((t) => t.webhookToken === providedToken && t.active !== false)
      : undefined;

    if (!tenant) {
      res.status(401).json({ ok: false, error: "unauthorized" });
      return;
    }

    const id = (req.body as { id?: unknown } | undefined)?.id;
    if (typeof id !== "string" || !id) {
      res.status(400).json({ ok: false, error: "missing_id" });
      return;
    }

    const doc = await getDocument(`outboundSms/${id}`);
    if (!doc || doc.tenantId !== tenant.id) {
      res.status(404).json({ ok: false, error: "not_found" });
      return;
    }

    await updateFields(`outboundSms/${id}`, { sentAt: new Date() });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("mark-sms-sent error:", err);
    res.status(500).json({ ok: false, error: "internal_error", message: (err as Error).message });
  }
}
