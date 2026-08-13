import { incrementFields, listCollection, setDocument, updateFields } from "./lib/firestoreRest.js";
import type { VercelRequest, VercelResponse } from "./lib/types.js";
import { bundleExpiryFor, parseEvcSms, type BundleTier, type DurationUnit } from "../src/utils/parseEvcSms.js";

const DURATION_UNITS: DurationUnit[] = ["hours", "days", "months"];

function isDurationUnit(value: unknown): value is DurationUnit {
  return typeof value === "string" && (DURATION_UNITS as string[]).includes(value);
}

interface RegisteredBundle extends BundleTier {
  id: string;
}

/** Reads staff-managed bundle tiers from Firestore, skipping any malformed docs. */
async function loadBundles(): Promise<RegisteredBundle[]> {
  const docs = await listCollection("bundles");
  const bundles: RegisteredBundle[] = [];
  for (const doc of docs) {
    const amount = Number(doc.amount);
    const durationValue = Number(doc.durationValue);
    if (Number.isFinite(amount) && Number.isFinite(durationValue) && isDurationUnit(doc.durationUnit)) {
      bundles.push({ id: doc.id, amount, durationValue, durationUnit: doc.durationUnit });
    }
  }
  return bundles;
}

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
    const [customers, bundles] = await Promise.all([listCollection("customers"), loadBundles()]);
    const match = customers.find(
      (c) =>
        normalizePhone(String(c.mainPhone ?? "")) === normalizedTarget ||
        normalizePhone(String(c.backupPhone ?? "")) === normalizedTarget
    );

    if (!match) {
      res.status(200).json({ ok: true, matched: false, reason: "no_customer_match" });
      return;
    }

    // Several packages can share the same $ price (e.g. the original
    // airtime tiers, Tanaad, and Bulaal Lite all sell $0.5), so the amount
    // alone doesn't say which one this top-up was for. If this customer is
    // pinned to a specific bundle (Customer form -> "Assigned Bundle") and
    // this top-up matches its price, use that one — unambiguous. Otherwise
    // fall back to a best-effort global amount match across all registered
    // bundles (or the hardcoded defaults if none are registered yet), same
    // as before assignment existed.
    const assignedBundleId = typeof match.bundleId === "string" ? match.bundleId : null;
    const assignedBundle = assignedBundleId
      ? bundles.find((b) => b.id === assignedBundleId)
      : undefined;
    const usesAssignedBundle =
      assignedBundle !== undefined && Math.abs(assignedBundle.amount - transaction.amount) < 0.001;

    // Auto-renew: a top-up resets the bundle's validity window from the SMS
    // timestamp. This also naturally re-arms the 24h expiry alert, since
    // check-expiry only re-notifies when bundleExpiry differs from the last
    // value it alerted on — no separate reset of lastExpiryAlertSentFor
    // needed here. An amount outside the known tiers still gets logged,
    // just without touching bundleExpiry, so nothing is silently guessed.
    const newExpiry = usesAssignedBundle
      ? bundleExpiryFor(transaction, [assignedBundle])
      : bundleExpiryFor(transaction, bundles);
    if (newExpiry) {
      await updateFields(`customers/${match.id}`, { bundleExpiry: newExpiry });
    }

    // Tracked separately from bundleExpiry so Analytics can rank customers
    // by total spend even when an amount doesn't map to a known tier.
    await incrementFields(`customers/${match.id}`, { totalTopupAmount: transaction.amount });

    const renewalNote = newExpiry
      ? ` Bundle renewed until ${newExpiry.toISOString()}${usesAssignedBundle ? " (assigned bundle)" : " (best-effort match — no bundle assigned)"}.`
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
      usedAssignedBundle: usesAssignedBundle,
    });
  } catch (err) {
    console.error("sms-webhook error:", err);
    res.status(500).json({ ok: false, error: "internal_error", message: (err as Error).message });
  }
}
