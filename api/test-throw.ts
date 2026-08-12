import type { VercelRequest, VercelResponse } from "./_lib/types";

function boom(): never {
  throw new Error("intentional test error");
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    await Promise.resolve();
    boom();
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, message: (err as Error).message });
  }
}
