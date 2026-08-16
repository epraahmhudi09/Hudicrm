import { getAccessToken, getServiceAccount } from "./googleAuth.js";

const IDENTITY_SCOPE = "https://www.googleapis.com/auth/identitytoolkit";

interface IdentityErrorBody {
  error?: { message?: string };
}

function projectBase(): string {
  return `https://identitytoolkit.googleapis.com/v1/projects/${getServiceAccount().project_id}`;
}

async function adminFetch(path: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const token = await getAccessToken([IDENTITY_SCOPE]);
  const res = await fetch(`${projectBase()}${path}`, {
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
  const json = await adminFetch("/accounts", { email, password, emailVerified: false });
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
