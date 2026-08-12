import type { Timestamp } from "firebase/firestore";

export type CustomerStatus = "loyal" | "normal";

export interface Customer {
  id: string;
  name: string;
  mainPhone: string;
  backupPhone: string;
  bundle: string;
  status: CustomerStatus;
  bundleExpiry: Timestamp | null;
  /** Set by the scheduled Cloud Function — never written by the client. */
  lastExpiryAlertSentFor: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface CustomerFormData {
  name: string;
  mainPhone: string;
  backupPhone: string;
  bundle: string;
  status: CustomerStatus;
  /** yyyy-mm-dd date input value, or "" for no expiry set. */
  bundleExpiry: string;
}

export const EMPTY_CUSTOMER_FORM: CustomerFormData = {
  name: "",
  mainPhone: "",
  backupPhone: "",
  bundle: "",
  status: "normal",
  bundleExpiry: "",
};

export type CustomerFilter = "all" | "loyal" | "normal" | "expiring";

export type ActivityType = "created" | "status_change" | "call" | "note" | "updated" | "topup";

export interface CustomerActivity {
  id: string;
  type: ActivityType;
  message: string;
  createdBy: string;
  createdAt: Timestamp | null;
}
