import { requirePlatformAdmin } from "./_lib/adminAuth.js";
import { deleteDocument, updateFields } from "./_lib/firestoreRest.js";
import { deleteAuthUser, setAuthUserDisabled } from "./_lib/identityRest.js";
import type { VercelRequest, VercelResponse } from "./_lib/types.js";

interface ManageUserBody {
  action?: unknown;
  uid?: unknown;
}

/**
 * Platform-admin-only: disable/enable/delete another user's login. Deleting
 * only removes that login (Firebase Auth account + its users/{uid} doc) —
 * the tenant's business data and tenants/{tenantId} doc are left alone, in
 * case other staff still use that tenant or the admin re-invites someone
 * later. A tenant with zero remaining logins just becomes unreachable, not
 * deleted.
 *
 *   POST /api/admin-manage-user
 *   Headers: Authorization: Bearer <caller's Firebase ID token>
 *   Body: { action: "disable" | "enable" | "delete", uid: string }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ ok: false, error: "method_not_allowed" });
      return;
    }

    const { uid: callerUid } = await requirePlatformAdmin(req);

    const body = req.body as ManageUserBody;
    const action = body.action;
    const uid = typeof body.uid === "string" ? body.uid : "";

    if (!uid || (action !== "disable" && action !== "enable" && action !== "delete")) {
      res.status(400).json({ ok: false, error: "invalid_request" });
      return;
    }
    if (uid === callerUid) {
      res.status(400).json({ ok: false, error: "cannot_manage_self" });
      return;
    }

    if (action === "delete") {
      await deleteAuthUser(uid);
      await deleteDocument(`users/${uid}`);
    } else {
      const disabled = action === "disable";
      await setAuthUserDisabled(uid, disabled);
      await updateFields(`users/${uid}`, { disabled });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    const message = (err as Error).message;
    if (message === "missing_auth_token" || message === "not_platform_admin") {
      res.status(403).json({ ok: false, error: "forbidden" });
      return;
    }
    console.error("admin-manage-user error:", err);
    res.status(500).json({ ok: false, error: "internal_error", message });
  }
}
