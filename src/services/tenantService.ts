import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { Tenant } from "../types/tenant";

/** A tenant's own signed-in users can read their own tenants/{tenantId} doc (e.g. for their webhook token). */
export async function getTenant(tenantId: string): Promise<Tenant | null> {
  const snap = await getDoc(doc(db, "tenants", tenantId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Tenant) : null;
}
