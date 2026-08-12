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
const EVC_SELL_AIRTIME_PATTERN =
  /^(?<txnId>\S+)\s+confirmed\.\s+You sell\s+\$?\+?(?<amount>[\d.]+)\s+of airtime to\s+(?<phone>\d+)\s+on\s+(?<date>\d{2}-\d{2}-\d{4})\s+at\s+(?<time>\d{2}:\d{2}:\d{2})\s+New EVC balance is\s+\$?\+?(?<balance>[\d.]+)/i;

function parseEvcDate(date: string, time: string): Date | null {
  const [day, month, year] = date.split("-").map(Number);
  const [hour, minute, second] = time.split(":").map(Number);
  if ([day, month, year, hour, minute, second].some((n) => Number.isNaN(n))) return null;
  const parsed = new Date(year, month - 1, day, hour, minute, second);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Parses an EVC Plus "sell airtime" confirmation SMS into structured fields.
 * Returns null if the message doesn't match the known format (e.g. a
 * different transaction type, or an unrelated SMS) rather than throwing —
 * callers should treat null as "not a recognized top-up message".
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
