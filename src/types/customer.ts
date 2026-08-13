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
  /**
   * Running total of EVC top-up amounts credited to this customer, in
   * dollars. Incremented atomically by the SMS webhook — absent (undefined)
   * on customers who have never had a matched top-up; treat as 0.
   */
  totalTopupAmount?: number;
  /**
   * References a bundles/{id} doc — which registered package this customer
   * is subscribed to. Several packages can share the same $ price (e.g.
   * Tanaad vs Bulaal Lite vs the original airtime tiers all sell $0.5), so
   * the SMS webhook can't tell them apart from the top-up amount alone;
   * this pins the customer to the right one. Null/absent if not yet
   * assigned, in which case the webhook falls back to a best-effort global
   * amount match.
   */
  bundleId?: string | null;
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
  /** bundles/{id}, or "" for unassigned. */
  bundleId: string;
}

export const EMPTY_CUSTOMER_FORM: CustomerFormData = {
  name: "",
  mainPhone: "",
  backupPhone: "",
  bundle: "",
  status: "normal",
  bundleExpiry: "",
  bundleId: "",
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
