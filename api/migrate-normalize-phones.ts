import { listCollection, updateFields } from "./_lib/firestoreRest.js";
import type { VercelRequest, VercelResponse } from "./_lib/types.js";

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-9);
}

/**
 * One-time (safely re-runnable) migration: backfills mainPhoneNormalized /
 * backupPhoneNormalized on every existing customer doc. New customers get
 * these fields automatically (see customerService.ts), but ones created
 * before that change need this to catch up — sms-webhook now queries
 * directly on these fields instead of scanning every customer, so a
 * customer missing them wouldn't be found by an incoming top-up.
 *
 *   https://<your-vercel-domain>/api/migrate-normalize-phones?token=<CRON_SECRET>
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expectedToken = process.env.CRON_SECRET;
    const providedToken =
      (req.query.token as string | undefined) ?? (req.headers["x-cron-token"] as string | undefined);

    if (!expectedToken || providedToken !== expectedToken) {
      res.status(401).json({ ok: false, error: "unauthorized" });
      return;
    }

    const customers = await listCollection("customers");
    let updated = 0;
    let skipped = 0;

    for (const customer of customers) {
      const mainPhoneNormalized = normalizePhone(String(customer.mainPhone ?? ""));
      const backupPhoneNormalized = customer.backupPhone
        ? normalizePhone(String(customer.backupPhone))
        : "";

      if (
        customer.mainPhoneNormalized === mainPhoneNormalized &&
        (customer.backupPhoneNormalized ?? "") === backupPhoneNormalized
      ) {
        skipped++;
        continue;
      }

      await updateFields(`customers/${customer.id}`, {
        mainPhoneNormalized,
        backupPhoneNormalized,
      });
      updated++;
    }

    res.status(200).json({ ok: true, updated, skipped, total: customers.length });
  } catch (err) {
    console.error("migrate-normalize-phones error:", err);
    res.status(500).json({ ok: false, error: "internal_error", message: (err as Error).message });
  }
}
