import { getDocument } from "./firestoreRest.js";
import { verifyIdToken } from "./identityRest.js";
import type { VercelRequest } from "./types.js";

/**
 * Confirms the request carries a valid Firebase ID token for a signed-in
 * user whose users/{uid} doc has isPlatformAdmin: true. Throws (caller
 * should respond 401/403) otherwise.
 */
export async function requirePlatformAdmin(req: VercelRequest): Promise<{ uid: string }> {
  const authHeader = req.headers.authorization;
  const headerValue = typeof authHeader === "string" ? authHeader : undefined;
  const idToken = headerValue?.startsWith("Bearer ") ? headerValue.slice(7) : undefined;
  if (!idToken) throw new Error("missing_auth_token");

  const { uid } = await verifyIdToken(idToken);
  const userDoc = await getDocument(`users/${uid}`);
  if (!userDoc || userDoc.isPlatformAdmin !== true) throw new Error("not_platform_admin");

  return { uid };
}
