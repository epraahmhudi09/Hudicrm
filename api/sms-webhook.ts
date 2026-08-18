import {
  addDocument,
  getDocument,
  incrementFields,
  queryEqual,
  setDocument,
  updateFields,
  type FirestoreDoc,
} from "./_lib/firestoreRest.js";
import { sendPushToTokens } from "./_lib/fcmRest.js";
import type { VercelRequest, VercelResponse } from "./_lib/types.js";
import {
  bundleExpiryFor,
  parseEvcSms,
  type BundleTier,
  type DurationUnit,
  type EvcTopupTransaction,
} from "../src/utils/parseEvcSms.js";

// A real EVC "sell airtime" SMS should never report a balance higher than
// the reseller's last known balance (a sale only draws it down) unless a
// reload happened in between — that's plausible, so this isn't blocked, just
// flagged for a human to glance at. Same for a transaction timestamped
// meaningfully before the last one processed: SMS should arrive in order, so
// a backdated one is more likely a replayed/tampered message than a real
// out-of-order delivery.
const BACKDATE_TOLERANCE_MS = 3 * 60 * 1000;

const DURATION_UNITS: DurationUnit[] = ["hours", "days", "months"];

function isDurationUnit(value: unknown): value is DurationUnit {
  return typeof value === "string" && (DURATION_UNITS as string[]).includes(value);
}

interface RegisteredBundle extends BundleTier {
  id: string;
}

/** Reads a tenant's staff-managed bundle tiers, skipping any malformed docs. */
async function loadBundles(tenantId: string): Promise<RegisteredBundle[]> {
  const docs = await queryEqual("bundles", { tenantId });
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

interface Tenant {
  id: string;
  webhookToken: string;
  lastKnownBalance?: number;
  lastTransactionAt?: Date;
}

/** Resolves a per-tenant webhook token (from the tenants collection) to its tenantId, or null if unrecognized/inactive. */
async function resolveTenant(token: string): Promise<Tenant | null> {
  const matches = await queryEqual("tenants", { webhookToken: token });
  const match = matches.find((t) => t.active !== false);
  if (!match) return null;
  return {
    id: match.id,
    webhookToken: String(match.webhookToken),
    lastKnownBalance: typeof match.lastKnownBalance === "number" ? match.lastKnownBalance : undefined,
    lastTransactionAt: match.lastTransactionAt instanceof Date ? match.lastTransactionAt : undefined,
  };
}

/**
 * Flags reasons a parsed transaction looks tampered with or replayed rather
 * than a genuine, freshly-received EVC SMS. Never blocks the top-up from
 * being applied — a false positive here just means an extra alert a human
 * dismisses, whereas blocking on one risks silently dropping a real renewal.
 */
async function detectAnomalies(
  tenant: Tenant,
  transaction: EvcTopupTransaction
): Promise<string[]> {
  const reasons: string[] = [];

  const existingTopup = await getDocument(`topups/evc-${transaction.transactionId}`);
  if (existingTopup) reasons.push("duplicate_transaction");

  if (typeof tenant.lastKnownBalance === "number" && transaction.newBalance > tenant.lastKnownBalance) {
    reasons.push("balance_increased_after_sale");
  }

  if (
    tenant.lastTransactionAt &&
    transaction.occurredAt.getTime() < tenant.lastTransactionAt.getTime() - BACKDATE_TOLERANCE_MS
  ) {
    reasons.push("backdated_timestamp");
  }

  return reasons;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-9);
}

/**
 * A phone that doesn't match any existing customer might still be a known
 * prospect — someone imported for a WhatsApp broadcast (see
 * broadcastContacts) making their very first top-up. If so, promote them to
 * a real customers/{id} doc on the spot, same as a manually-added customer,
 * so this and every future top-up from them gets tracked normally.
 */
async function convertProspectIfKnown(
  tenantId: string,
  normalizedTarget: string
): Promise<FirestoreDoc | null> {
  const prospects = await queryEqual("broadcastContacts", { tenantId });
  const prospect = prospects.find(
    (p) =>
      !p.convertedCustomerId &&
      (normalizePhone(String(p.mainPhone ?? "")) === normalizedTarget ||
        normalizePhone(String(p.backupPhone ?? "")) === normalizedTarget)
  );
  if (!prospect) return null;

  const bundleId = typeof prospect.bundleId === "string" ? prospect.bundleId : null;
  let bundleName = "General";
  if (bundleId) {
    const bundleDoc = await getDocument(`bundles/${bundleId}`);
    if (bundleDoc && typeof bundleDoc.name === "string" && bundleDoc.name.trim()) {
      bundleName = bundleDoc.name;
    }
  }

  const now = new Date();
  const customerId = await addDocument("customers", {
    tenantId,
    name: String(prospect.name ?? "Customer"),
    mainPhone: String(prospect.mainPhone ?? ""),
    backupPhone: String(prospect.backupPhone ?? ""),
    bundle: bundleName,
    status: "normal",
    bundleExpiry: null,
    totalTopupAmount: 0,
    bundleId,
    createdAt: now,
    updatedAt: now,
  });

  await updateFields(`broadcastContacts/${prospect.id}`, { convertedCustomerId: customerId });

  return { id: customerId, name: prospect.name, bundleId } as FirestoreDoc;
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
 *   https://<your-vercel-domain>/api/sms-webhook?token=<tenant's webhookToken>
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ ok: false, error: "method_not_allowed" });
      return;
    }

    const providedToken =
      (req.query.token as string | undefined) ?? (req.headers["x-webhook-token"] as string | undefined);

    const tenant = providedToken ? await resolveTenant(providedToken) : null;
    if (!tenant) {
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

    const anomalyReasons = await detectAnomalies(tenant, transaction);
    if (anomalyReasons.length > 0) {
      await addDocument("fraudAlerts", {
        tenantId: tenant.id,
        transactionId: transaction.transactionId,
        phone: transaction.phone,
        amount: transaction.amount,
        newBalance: transaction.newBalance,
        reasons: anomalyReasons,
        detectedAt: new Date(),
        reviewed: false,
      });

      const tenantUsers = await queryEqual("users", { tenantId: tenant.id });
      const tokens = tenantUsers
        .map((u) => u.fcmToken as string | undefined)
        .filter((t): t is string => Boolean(t));
      if (tokens.length > 0) {
        await sendPushToTokens(tokens, {
          title: "⚠️ Suspicious top-up detected",
          body: `$${transaction.amount.toFixed(2)} to ${transaction.phone} looked unusual — check Fraud Alerts.`,
        }).catch(() => {});
      }
    }

    // A genuine duplicate (the exact same transaction, resent) was already
    // fully applied the first time — the alert above is logged, but redoing
    // the customer match/writes below would just repeat identical work.
    if (anomalyReasons.includes("duplicate_transaction")) {
      res.status(200).json({ ok: true, matched: false, duplicate: true });
      return;
    }

    await updateFields(`tenants/${tenant.id}`, {
      lastKnownBalance: transaction.newBalance,
      lastTransactionAt: transaction.occurredAt,
    });

    const normalizedTarget = normalizePhone(transaction.phone);
    const [customers, bundles] = await Promise.all([
      queryEqual("customers", { tenantId: tenant.id }),
      loadBundles(tenant.id),
    ]);
    let match = customers.find(
      (c) =>
        normalizePhone(String(c.mainPhone ?? "")) === normalizedTarget ||
        normalizePhone(String(c.backupPhone ?? "")) === normalizedTarget
    );

    if (!match) {
      match = (await convertProspectIfKnown(tenant.id, normalizedTarget)) ?? undefined;
    }

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

    // Flat, top-level record (not a customer subcollection) so date-ranged
    // analytics queries only need Firestore's automatic single-field index
    // on createdAt — same deterministic ID as the activity doc below, so a
    // retried/duplicated forward overwrites instead of double-counting.
    await setDocument(`topups/evc-${transaction.transactionId}`, {
      tenantId: tenant.id,
      customerId: match.id,
      customerName: String(match.name ?? "Customer"),
      amount: transaction.amount,
      createdAt: transaction.occurredAt,
    });

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
