import type { VercelRequest, VercelResponse } from "./_lib/types";
import { getAccessToken } from "./_lib/googleAuth";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const token = await getAccessToken(["https://www.googleapis.com/auth/datastore"]);
    res.status(200).json({ ok: true, tokenLength: token.length });
  } catch (err) {
    res.status(500).json({ ok: false, message: (err as Error).message, stack: (err as Error).stack });
  }
}
