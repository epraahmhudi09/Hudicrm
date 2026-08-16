import {
  addDocument,
  listCollection,
  setDocument,
  updateFields,
} from "./_lib/firestoreRest.js";
import type { VercelRequest, VercelResponse } from "./_lib/types.js";

const BACKFILL_COLLECTIONS = ["customers", "bundles", "debtCustomers", "topups", "outboundSms"];

/**
 * One-time (safely re-runnable) migration for the multi-tenant rollout:
 * creates a tenants/{tenantId} doc for the existing single-tenant business,
 * reusing the current SMS_WEBHOOK_SECRET/SUPPORT_CONTACT_PHONE(_BACKUP) env
 * values so the live Termux forwarder needs zero changes, marks the given
 * user as that tenant's owner + platform admin, and stamps tenantId onto
 * every existing doc across the previously-flat, shared collections.
 * Docs that already have a tenantId are left untouched, so re-running this
 * after partial failure just picks up where it left off.
 *
 *   https://<your-vercel-domain>/api/migrate-tenants?token=<CRON_SECRET>&email=<owner email>&ownerName=<name>&businessName=<name>
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expectedToken = process.env.CRON_SECRET;
    const providedToken =
      (req.query.token as string | undefined) ?? (req.headers["x-cron-token"] as string | undefined);

    if (!expectedToken || providedToken !== expectedToken) {
      res.status(401).json({ ok: false, error: "unauthorized" });
      return;
    }

    const email = req.query.email as string | undefined;
    if (!email) {
      res.status(400).json({ ok: false, error: "missing_email" });
      return;
    }
    const ownerName = (req.query.ownerName as string | undefined) ?? "Owner";
    const businessName = (req.query.businessName as string | undefined) ?? "Amtel";

    const users = await listCollection("users");
    const owner = users.find((u) => u.email === email);
    if (!owner) {
      res.status(404).json({ ok: false, error: "user_not_found", message: `No users/{uid} doc has email=${email}` });
      return;
    }

    let tenantId: string;
    if (typeof owner.tenantId === "string" && owner.tenantId) {
      tenantId = owner.tenantId;
    } else {
      tenantId = await addDocument("tenants", {
        businessName,
        ownerName,
        webhookToken: process.env.SMS_WEBHOOK_SECRET ?? "",
        supportPhone: process.env.SUPPORT_CONTACT_PHONE ?? "",
        supportPhoneBackup: process.env.SUPPORT_CONTACT_PHONE_BACKUP ?? "",
        active: true,
        createdAt: new Date(),
      });
      await setDocument(`users/${owner.id}`, {
        tenantId,
        email,
        isPlatformAdmin: true,
        disabled: false,
        updatedAt: new Date(),
      });
    }

    const backfilled: Record<string, number> = {};
    for (const collectionId of BACKFILL_COLLECTIONS) {
      const docs = await listCollection(collectionId);
      let count = 0;
      for (const doc of docs) {
        if (doc.tenantId) continue;
        await updateFields(`${collectionId}/${doc.id}`, { tenantId });
        count++;
      }
      backfilled[collectionId] = count;
    }

    res.status(200).json({ ok: true, tenantId, backfilled });
  } catch (err) {
    console.error("migrate-tenants error:", err);
    res.status(500).json({ ok: false, error: "internal_error", message: (err as Error).message });
  }
}
