import { deleteDocument } from "./_lib/firestoreRest.js";
import type { VercelRequest, VercelResponse } from "./_lib/types.js";

/** Temporary, CRON_SECRET-gated: deletes specific tenant doc IDs given as ?ids=a,b,c. Remove after use. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const expectedToken = process.env.CRON_SECRET;
  const providedToken = req.query.token as string | undefined;
  if (!expectedToken || providedToken !== expectedToken) {
    res.status(401).json({ ok: false });
    return;
  }
  const ids = String(req.query.ids ?? "").split(",").filter(Boolean);
  for (const id of ids) {
    await deleteDocument(`tenants/${id}`);
  }
  res.status(200).json({ ok: true, deleted: ids });
}
