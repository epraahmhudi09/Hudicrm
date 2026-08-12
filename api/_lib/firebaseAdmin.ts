import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App | undefined;
let db: Firestore | undefined;

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

/**
 * The Firestore Node SDK defaults to gRPC transport, which pulls in
 * @grpc/grpc-js — a package with dynamic requires for its wire-format/proto
 * files that don't always survive esbuild-style bundling in serverless
 * environments (Vercel functions included), failing at runtime rather than
 * build time. Forcing REST transport avoids gRPC entirely.
 */
export function getDb(): Firestore {
  if (db) return db;
  db = getFirestore(getAdminApp());
  db.settings({ preferRest: true });
  return db;
}
