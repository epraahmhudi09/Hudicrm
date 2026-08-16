import { getAccessToken } from "./googleAuth.js";

const IDENTITY_SCOPE = "https://www.googleapis.com/auth/identitytoolkit";
const IDENTITY_BASE = "https://identitytoolkit.googleapis.com/v1";

interface IdentityErrorBody {
  error?: { message?: string };
}

// The identitytoolkit v1 accounts:* RPCs are the same ones the client SDK
// uses (accounts:signUp, accounts:update, accounts:delete) — normally
// authenticated with the public Web API key, but Google also accepts an
// OAuth bearer token in its place, which runs them in "admin mode": no
// idToken/session is minted, so creating or disabling another user here
// never disturbs the caller's own signed-in session.
async function adminFetch(path: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const token = await getAccessToken([IDENTITY_SCOPE]);
  const res = await fetch(`${IDENTITY_BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const message = (json as IdentityErrorBody).error?.message ?? `HTTP ${res.status}`;
    throw new Error(`Identity Toolkit error: ${message}`);
  }
  return json;
}

/**
 * Verifies a Firebase Auth ID token by asking Google to look up the account
 * it belongs to — offloads signature/expiry verification to Google's own
 * servers instead of hand-rolling JWKS validation. Keyed by the same public
 * Web API key the client SDK already uses (not a secret).
 */
export async function verifyIdToken(idToken: string): Promise<{ uid: string; email: string | null }> {
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) throw new Error("VITE_FIREBASE_API_KEY environment variable is not set");

  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const json = (await res.json()) as {
    users?: Array<{ localId: string; email?: string }>;
  } & IdentityErrorBody;
  if (!res.ok) {
    throw new Error(`Invalid ID token: ${json.error?.message ?? `HTTP ${res.status}`}`);
  }
  const user = json.users?.[0];
  if (!user) throw new Error("Invalid ID token: no matching user");
  return { uid: user.localId, email: user.email ?? null };
}

/** Creates a new Firebase Auth user without affecting the caller's own session. */
export async function createAuthUser(email: string, password: string): Promise<string> {
  const json = await adminFetch("/accounts:signUp", { email, password, returnSecureToken: false });
  const uid = json.localId as string | undefined;
  if (!uid) throw new Error("Identity Toolkit did not return a new user id");
  return uid;
}

export async function setAuthUserDisabled(uid: string, disabled: boolean): Promise<void> {
  await adminFetch("/accounts:update", { localId: uid, disableUser: disabled });
}

export async function deleteAuthUser(uid: string): Promise<void> {
  await adminFetch("/accounts:delete", { localId: uid });
}
