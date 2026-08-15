export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** Strips everything but digits so differently-formatted versions of the same number compare equal. */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}
