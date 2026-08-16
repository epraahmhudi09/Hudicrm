import type { Timestamp } from "firebase/firestore";

export interface Tenant {
  id: string;
  businessName: string;
  ownerName: string;
  webhookToken: string;
  supportPhone: string;
  supportPhoneBackup: string;
  active: boolean;
  createdAt: Timestamp | null;
}

export interface TenantUser {
  uid: string;
  tenantId: string;
  email: string;
  isPlatformAdmin: boolean;
  disabled: boolean;
}
