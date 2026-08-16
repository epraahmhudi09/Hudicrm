import { randomBytes } from "node:crypto";
import { requirePlatformAdmin } from "./lib/adminAuth.js";
import { addDocument, setDocument } from "./lib/firestoreRest.js";
import { createAuthUser } from "./lib/identityRest.js";
import type { VercelRequest, VercelResponse } from "./lib/types.js";

interface CreateUserBody {
  ownerName?: unknown;
  businessName?: unknown;
  email?: unknown;
  password?: unknown;
  supportPhone?: unknown;
  supportPhoneBackup?: unknown;
}

function requiredString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Platform-admin-only: creates a new tenant business + its first login.
 * Called from the in-app "Users" admin page rather than Firebase Console,
 * so the caller's own session must stay intact — createAuthUser hits the
 * Identity Toolkit admin REST API (OAuth service account) instead of the
 * client SDK's createUserWithEmailAndPassword, which would sign the admin
 * out and into the new account.
 *
 *   POST /api/admin-create-user
 *   Headers: Authorization: Bearer <caller's Firebase ID token>
 *   Body: { ownerName, businessName, email, password, supportPhone, supportPhoneBackup? }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ ok: false, error: "method_not_allowed" });
      return;
    }

    await requirePlatformAdmin(req);

    const body = req.body as CreateUserBody;
    const ownerName = requiredString(body.ownerName);
    const businessName = requiredString(body.businessName);
    const email = requiredString(body.email);
    const password = requiredString(body.password);
    const supportPhone = requiredString(body.supportPhone);
    const supportPhoneBackup = requiredString(body.supportPhoneBackup) ?? "";

    if (!ownerName || !businessName || !email || !password || !supportPhone) {
      res.status(400).json({ ok: false, error: "missing_fields" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ ok: false, error: "weak_password" });
      return;
    }

    const webhookToken = randomBytes(16).toString("hex");

    const tenantId = await addDocument("tenants", {
      businessName,
      ownerName,
      webhookToken,
      supportPhone,
      supportPhoneBackup,
      active: true,
      createdAt: new Date(),
    });

    const uid = await createAuthUser(email, password);

    await setDocument(`users/${uid}`, {
      tenantId,
      email,
      isPlatformAdmin: false,
      disabled: false,
      updatedAt: new Date(),
    });

    res.status(200).json({
      ok: true,
      tenantId,
      webhookToken,
      urls: {
        smsWebhook: "https://hudicrm.vercel.app/api/sms-webhook",
        pendingSms: "https://hudicrm.vercel.app/api/pending-sms",
        markSmsSent: "https://hudicrm.vercel.app/api/mark-sms-sent",
      },
    });
  } catch (err) {
    const message = (err as Error).message;
    if (message === "missing_auth_token" || message === "not_platform_admin") {
      res.status(403).json({ ok: false, error: "forbidden" });
      return;
    }
    console.error("admin-create-user error:", err);
    res.status(500).json({ ok: false, error: "internal_error", message });
  }
}
