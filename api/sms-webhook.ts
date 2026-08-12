import { listCollection, setDocument, updateFields } from "./lib/firestoreRest.js";
import type { VercelRequest, VercelResponse } from "./lib/types.js";
import { bundleExpiryFor, parseEvcSms } from "../src/utils/parseEvcSms.js";

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-9);
}

function extractSmsText(body: unknown): string | null {
  if (typeof body === "string") return body;
  if (body && typeof body === "object") {
    const candidates = ["message", "body", "text", "sms", "msg"];
    for (const key of candidates) {
      const value = (body as Record<string, unknown>)[key];
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  return null;
}

/**
 * Webhook for SMS-forwarding apps (installed on the phone holding the Amtel
 * EVC SIM, sender "913") to POST incoming top-up confirmation texts to.
 * Parses the EVC Plus "sell airtime" format, matches the recipient phone
 * number against the customers collection, auto-renews that customer's
 * bundleExpiry per the confirmed pricing tiers (see
 * parseEvcSms.bundleExpiryFor), and logs a top-up activity. Unregistered
 * numbers are ignored — nothing is created or written for them.
 *
 * Configure the forwarding app to POST JSON like {"message": "<sms text>"}
 * (or form field "message"/"body"/"text") to:
 *   https://<your-vercel-domain>/api/sms-webhook?token=<SMS_WEBHOOK_SECRET>
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

    const text = extractSmsText(req.body);
    if (!text) {
      res.status(400).json({ ok: false, error: "no_message_text_found" });
      return;
    }

    const transaction = parseEvcSms(text);
    if (!transaction) {
      res.status(200).json({ ok: true, matched: false, reason: "unrecognized_format" });
      return;
    }

    const normalizedTarget = normalizePhone(transaction.phone);
    const customers = await listCollection("customers");
    const match = customers.find(
      (c) =>
        normalizePhone(String(c.mainPhone ?? "")) === normalizedTarget ||
        normalizePhone(String(c.backupPhone ?? "")) === normalizedTarget
    );

    if (!match) {
      res.status(200).json({ ok: true, matched: false, reason: "no_customer_match" });
      return;
    }

    // Auto-renew: a top-up resets the bundle's validity window from the SMS
    // timestamp, per the confirmed pricing tiers. This also naturally
    // re-arms the 24h expiry alert, since check-expiry only re-notifies
    // when bundleExpiry differs from the last value it alerted on — no
    // separate reset of lastExpiryAlertSentFor needed here. An amount
    // outside the known tiers still gets logged, just without touching
    // bundleExpiry, so nothing is silently guessed.
    const newExpiry = bundleExpiryFor(transaction);
    if (newExpiry) {
      await updateFields(`customers/${match.id}`, { bundleExpiry: newExpiry });
    }

    const renewalNote = newExpiry
      ? ` Bundle renewed until ${newExpiry.toISOString()}.`
      : ` (No matching bundle tier for $${transaction.amount.toFixed(2)} — expiry left unchanged.)`;

    // Deterministic doc ID keyed on the EVC transaction ID makes this
    // idempotent — if the forwarder app retries/duplicates a POST, this just
    // overwrites the same activity instead of creating a second one.
    await setDocument(`customers/${match.id}/activities/evc-${transaction.transactionId}`, {
      type: "topup",
      message: `EVC top-up: $${transaction.amount.toFixed(2)} airtime (new balance $${transaction.newBalance.toFixed(2)}, ref ${transaction.transactionId}).${renewalNote}`,
      createdBy: "EVC SMS",
      createdAt: transaction.occurredAt,
    });

    res.status(200).json({
      ok: true,
      matched: true,
      customerId: match.id,
      bundleExpiry: newExpiry ? newExpiry.toISOString() : null,
    });
  } catch (err) {
    console.error("sms-webhook error:", err);
    res.status(500).json({ ok: false, error: "internal_error", message: (err as Error).message });
  }
}
