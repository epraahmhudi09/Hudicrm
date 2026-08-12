import { createSign, generateKeyPairSync } from "node:crypto";
import type { VercelRequest, VercelResponse } from "./_lib/types";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const signer = createSign("RSA-SHA256");
    signer.update("test");
    signer.end();
    const signature = signer.sign(privateKey).toString("base64");
    res.status(200).json({ ok: true, signatureLength: signature.length });
  } catch (err) {
    res.status(500).json({ ok: false, message: (err as Error).message });
  }
}
