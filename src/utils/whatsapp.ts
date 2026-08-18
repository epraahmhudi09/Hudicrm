const SOMALIA_COUNTRY_CODE = "252";

/**
 * Converts a Somali phone number in any common local format (with/without a
 * leading 0, with/without the 252 country code, with spaces or dashes) into
 * the bare international-digits format wa.me requires. Takes the last 9
 * digits as the subscriber number — same convention as normalizePhone in
 * api/sms-webhook.ts — so re-prefixing 252 is idempotent regardless of how
 * the number was originally entered.
 */
export function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `${SOMALIA_COUNTRY_CODE}${digits.slice(-9)}`;
}

/** Fills the {{name}} placeholder in a broadcast message template. */
export function fillTemplate(template: string, name: string): string {
  return template.replaceAll("{{name}}", name);
}

/** A click-to-chat link that opens WhatsApp with the message pre-filled — no API or approval needed. */
export function buildWhatsAppLink(phone: string, message: string): string {
  return `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`;
}
