import { listCollection, setDocument } from "./lib/firestoreRest.js";
import type { VercelRequest, VercelResponse } from "./lib/types.js";

const AMOUNT_PATTERN = /^EVC top-up: \$(\d+(?:\.\d+)?) airtime/;

/**
 * One-time (safely re-runnable) migration: the flat `topups` collection was
 * added after top-ups were already being logged as activities under each
 * customer, so historical ones never got a `topups` doc. Walks every
 * customer's activities, parses the $ amount back out of the existing
 * "EVC top-up: $X airtime..." message text, and writes a topups doc keyed
 * on the same activity ID the live webhook already uses — re-running this
 * just overwrites the same docs instead of duplicating.
 *
 *   https://<your-vercel-domain>/api/backfill-topups?token=<CRON_SECRET>
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
    let backfilled = 0;
    let skipped = 0;

    for (const customer of customers) {
      const activities = await listCollection(`customers/${customer.id}/activities`);
      for (const activity of activities) {
        if (activity.type !== "topup") continue;

        const match = AMOUNT_PATTERN.exec(String(activity.message ?? ""));
        const amount = match ? Number(match[1]) : NaN;
        if (!match || !Number.isFinite(amount)) {
          skipped++;
          continue;
        }

        await setDocument(`topups/${activity.id}`, {
          tenantId: customer.tenantId ?? null,
          customerId: customer.id,
          customerName: String(customer.name ?? "Customer"),
          amount,
          createdAt: activity.createdAt as Date,
        });
        backfilled++;
      }
    }

    res.status(200).json({ ok: true, backfilled, skipped });
  } catch (err) {
    console.error("backfill-topups error:", err);
    res.status(500).json({ ok: false, error: "internal_error", message: (err as Error).message });
  }
}
