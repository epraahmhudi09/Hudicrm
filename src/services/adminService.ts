import { collection, getCountFromServer, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";
import type { Tenant } from "../types/tenant";

export interface AdminUserRow {
  uid: string;
  email: string;
  disabled: boolean;
  tenant: Tenant;
  customerCount: number;
}

export interface CreateTenantUserPayload {
  ownerName: string;
  businessName: string;
  email: string;
  password: string;
  supportPhone: string;
  supportPhoneBackup: string;
}

export interface CreateTenantUserResult {
  tenantId: string;
  webhookToken: string;
  urls: { smsWebhook: string; pendingSms: string; markSmsSent: string };
}

async function callAdminApi<T>(path: string, body: unknown): Promise<T> {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error("Not signed in.");

  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { ok: boolean; error?: string; message?: string } & Record<
    string,
    unknown
  >;
  if (!res.ok || !json.ok) {
    if (json.error === "forbidden") throw new Error("You don't have permission to do that.");
    throw new Error(json.message ?? "Request failed. Please try again.");
  }
  return json as T;
}

/** One-time fetch (admin page, not streamed) joining users + tenants, with a live customer count per tenant. */
export async function getUsersWithTenants(): Promise<AdminUserRow[]> {
  const [usersSnap, tenantsSnap] = await Promise.all([
    getDocs(collection(db, "users")),
    getDocs(collection(db, "tenants")),
  ]);

  const tenantsById = new Map<string, Tenant>();
  tenantsSnap.docs.forEach((docSnap) => {
    tenantsById.set(docSnap.id, { id: docSnap.id, ...docSnap.data() } as Tenant);
  });

  // eslint-disable-next-line no-console
  console.log(
    "[DEBUG getUsersWithTenants]",
    "users:", usersSnap.docs.map((d) => ({ id: d.id, tenantId: d.data().tenantId, email: d.data().email })),
    "tenants:", tenantsSnap.docs.map((d) => d.id)
  );

  const rows: AdminUserRow[] = [];
  for (const userDoc of usersSnap.docs) {
    const data = userDoc.data();
    const tenantId = data.tenantId as string | undefined;
    const tenant = tenantId ? tenantsById.get(tenantId) : undefined;
    if (!tenant) continue;

    const countSnap = await getCountFromServer(
      query(collection(db, "customers"), where("tenantId", "==", tenantId))
    );

    rows.push({
      uid: userDoc.id,
      email: (data.email as string | undefined) ?? "—",
      disabled: (data.disabled as boolean | undefined) ?? false,
      tenant,
      customerCount: countSnap.data().count,
    });
  }

  rows.sort((a, b) => (b.tenant.createdAt?.toMillis() ?? 0) - (a.tenant.createdAt?.toMillis() ?? 0));
  return rows;
}

export async function createTenantUser(
  payload: CreateTenantUserPayload
): Promise<CreateTenantUserResult> {
  return callAdminApi<CreateTenantUserResult>("/api/admin-create-user", payload);
}

export async function manageTenantUser(
  uid: string,
  action: "disable" | "enable" | "delete"
): Promise<void> {
  await callAdminApi("/api/admin-manage-user", { uid, action });
}
