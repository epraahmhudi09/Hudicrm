export interface EvcTopupTransaction {
  transactionId: string;
  amount: number;
  phone: string;
  occurredAt: Date;
  newBalance: number;
}

// Matches messages like:
// "04241400000025630734 confirmed. You sell $+0.50 of airtime to 716389055
//  on 12-08-2026 at 09:15:18 New EVC balance is $+2.00."
// Note: amount/balance use \d+(?:\.\d+)? rather than [\d.]+ — the latter
// greedily swallows the sentence-ending period after the balance (e.g.
// "$+2.00." at the end of the message), producing "2.00." which Number()
// correctly refuses to parse as a valid number.
const EVC_SELL_AIRTIME_PATTERN =
  /^(?<txnId>\S+)\s+confirmed\.\s+You sell\s+\$?\+?(?<amount>\d+(?:\.\d+)?)\s+of airtime to\s+(?<phone>\d+)\s+on\s+(?<date>\d{2}-\d{2}-\d{4})\s+at\s+(?<time>\d{2}:\d{2}:\d{2})\s+New EVC balance is\s+\$?\+?(?<balance>\d+(?:\.\d+)?)/i;

// Amtel/EVC SMS timestamps are in East Africa Time (UTC+3) regardless of
// what timezone the process parsing them happens to run in (a dev machine
// might be EAT, but Vercel's functions run in UTC) — building an explicit
// offset into the ISO string makes the result correct either way, instead
// of silently drifting by a few hours depending on where this code runs.
function parseEvcDate(date: string, time: string): Date | null {
  const [day, month, year] = date.split("-").map(Number);
  const [hour, minute, second] = time.split(":").map(Number);
  if ([day, month, year, hour, minute, second].some((n) => Number.isNaN(n))) return null;
  const parsed = new Date(`${date.split("-").reverse().join("-")}T${time}+03:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Parses an EVC Plus "sell airtime" confirmation SMS into structured fields.
 * Returns null if the message doesn't match the known format (e.g. a
 * different transaction type, or an unrelated SMS) rather than throwing —
 * callers should treat null as "not a recognized top-up message". Shared
 * between the frontend and the /api serverless functions (both are ESM
 * TypeScript with no platform-specific APIs here, so a plain relative
 * import works from either side).
 */
export function parseEvcSms(text: string): EvcTopupTransaction | null {
  const match = EVC_SELL_AIRTIME_PATTERN.exec(text.trim());
  if (!match?.groups) return null;

  const { txnId, amount, phone, date, time, balance } = match.groups;
  const occurredAt = parseEvcDate(date, time);
  if (!occurredAt) return null;

  const parsedAmount = Number(amount);
  const parsedBalance = Number(balance);
  if (Number.isNaN(parsedAmount) || Number.isNaN(parsedBalance)) return null;

  return {
    transactionId: txnId,
    amount: parsedAmount,
    phone,
    occurredAt,
    newBalance: parsedBalance,
  };
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

// Business rules confirmed by the customer — pricing is tiered, not a flat
// rate per dollar (e.g. $0.25 and $1 both work out to different effective
// hourly rates), so this is a lookup table rather than a formula.
const BUNDLE_TIERS: Array<{ amount: number; expiryFrom: (occurredAt: Date) => Date }> = [
  { amount: 0.25, expiryFrom: (d) => addHours(d, 10) },
  { amount: 0.5, expiryFrom: (d) => addHours(d, 36) },
  { amount: 1, expiryFrom: (d) => addHours(d, 3 * 24) },
  { amount: 2.5, expiryFrom: (d) => addHours(d, 7 * 24) },
  { amount: 10, expiryFrom: (d) => addMonths(d, 1) },
];

/**
 * Computes when a bundle purchased in this transaction should expire, based
 * on the confirmed pricing tiers. Returns null for an amount that doesn't
 * exactly match a known tier — callers should still log the top-up but
 * leave bundleExpiry untouched rather than guess.
 */
export function bundleExpiryFor(transaction: EvcTopupTransaction): Date | null {
  const tier = BUNDLE_TIERS.find((t) => Math.abs(t.amount - transaction.amount) < 0.001);
  return tier ? tier.expiryFrom(transaction.occurredAt) : null;
}
