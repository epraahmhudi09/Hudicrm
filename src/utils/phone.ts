export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/**
 * Strips everything but digits and keeps only the last 9 (the Somali
 * subscriber number) so "717701253", "+252717701253", and "0717701253" all
 * normalize the same — same convention as normalizePhone in
 * api/sms-webhook.ts, which this must stay consistent with: customers get a
 * mainPhoneNormalized/backupPhoneNormalized field computed via this
 * function, and the webhook queries directly on it to find who topped up
 * without scanning every customer.
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-9);
}
