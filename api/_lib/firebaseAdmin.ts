import { cert, getApps, initializeApp, type App } from "firebase-admin/app";

let app: App | undefined;

/**
 * Vercel functions run outside Google Cloud, so (unlike Firebase Cloud
 * Functions) they need an explicit service account credential rather than
 * relying on ambient default credentials.
 */
export function getAdminApp(): App {
  if (app) return app;

  const existing = getApps();
  if (existing.length > 0) {
    app = existing[0];
    return app;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set");
  }

  const serviceAccount = JSON.parse(raw);
  app = initializeApp({ credential: cert(serviceAccount) });
  return app;
}
