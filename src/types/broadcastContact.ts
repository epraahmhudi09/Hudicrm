import type { Timestamp } from "firebase/firestore";

export interface BroadcastContact {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  sentAt: Timestamp | null;
  createdAt: Timestamp | null;
}
