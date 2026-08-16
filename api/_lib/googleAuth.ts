import { createSign } from "node:crypto";

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
}

let cachedAccount: ServiceAccount | undefined;
// Keyed by the joined scopes string — a single shared token would otherwise
// get reused across calls requesting different scopes (e.g. check-expiry
// asks for the Firestore "datastore" scope and then the FCM "messaging"
// scope in the same invocation), silently handing out a token that's valid
// for the wrong API and failing with ACCESS_TOKEN_SCOPE_INSUFFICIENT.
const cachedTokens = new Map<string, { value: string; expiresAt: number }>();

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function getServiceAccount(): ServiceAccount {
  if (cachedAccount) return cachedAccount;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set");
  cachedAccount = JSON.parse(raw);
  return cachedAccount!;
}

/**
 * Exchanges the service account's private key for a short-lived OAuth2
 * access token via Google's JWT-bearer grant — hand-rolled with Node's
 * built-in crypto + fetch instead of firebase-admin/google-auth-library,
 * whose dependency trees (grpc-js, etc.) don't reliably survive esbuild
 * bundling in serverless environments like this one.
 */
export async function getAccessToken(scopes: string[]): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const cacheKey = [...scopes].sort().join(" ");
  const cachedToken = cachedTokens.get(cacheKey);
  if (cachedToken && cachedToken.expiresAt > now + 30) return cachedToken.value;

  const account = getServiceAccount();

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: account.client_email,
      scope: scopes.join(" "),
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );

  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  signer.end();
  const signature = base64url(signer.sign(account.private_key));

  const assertion = `${header}.${claims}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to obtain Google OAuth token: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedTokens.set(cacheKey, { value: json.access_token, expiresAt: now + json.expires_in });
  return json.access_token;
}
