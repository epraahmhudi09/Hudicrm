import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getAdminApp } from "./_lib/firebaseAdmin";
import type { VercelRequest, VercelResponse } from "./_lib/types";
import { parseEvcSms } from "../src/utils/parseEvcSms";

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
 * EVC SIM) to POST incoming top-up confirmation texts to. Parses the EVC
 * Plus "sell airtime" format, matches the recipient phone number against
 * the customers collection, and logs a top-up activity automatically.
 *
 * Configure the forwarding app to POST JSON like {"message": "<sms text>"}
 * (or form field "message"/"body"/"text") to:
 *   https://<your-vercel-domain>/api/sms-webhook?token=<SMS_WEBHOOK_SECRET>
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  const db = getFirestore(getAdminApp());
  const normalizedTarget = normalizePhone(transaction.phone);
  const customersSnap = await db.collection("customers").get();
  const match = customersSnap.docs.find((doc) => {
    const data = doc.data();
    return (
      normalizePhone(String(data.mainPhone ?? "")) === normalizedTarget ||
      normalizePhone(String(data.backupPhone ?? "")) === normalizedTarget
    );
  });

  if (!match) {
    res.status(200).json({ ok: true, matched: false, reason: "no_customer_match" });
    return;
  }

  // Deterministic doc ID keyed on the EVC transaction ID makes this
  // idempotent — if the forwarder app retries/duplicates a POST, this just
  // overwrites the same activity instead of creating a second one.
  const activityRef = db
    .collection("customers")
    .doc(match.id)
    .collection("activities")
    .doc(`evc-${transaction.transactionId}`);

  await activityRef.set({
    type: "topup",
    message: `EVC top-up: $${transaction.amount.toFixed(2)} airtime (new balance $${transaction.newBalance.toFixed(2)}, ref ${transaction.transactionId}).`,
    createdBy: "EVC SMS",
    createdAt: Timestamp.fromDate(transaction.occurredAt),
  });

  res.status(200).json({ ok: true, matched: true, customerId: match.id });
}
