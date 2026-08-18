import type { Timestamp } from "firebase/firestore";

export interface BroadcastContact {
  id: string;
  tenantId: string;
  name: string;
  mainPhone: string;
  backupPhone: string;
  /** References a bundles/{id} doc — assigned when this contact converts to a real customer on their first top-up. */
  bundleId: string | null;
  sentAt: Timestamp | null;
  /** Set once a top-up from this contact's phone auto-registered them as a real customers/{id} doc. */
  convertedCustomerId: string | null;
  createdAt: Timestamp | null;
}
