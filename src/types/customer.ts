import type { Timestamp } from "firebase/firestore";

export type CustomerStatus = "loyal" | "normal";

export interface Customer {
  id: string;
  name: string;
  mainPhone: string;
  backupPhone: string;
  bundle: string;
  status: CustomerStatus;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface CustomerFormData {
  name: string;
  mainPhone: string;
  backupPhone: string;
  bundle: string;
  status: CustomerStatus;
}

export const EMPTY_CUSTOMER_FORM: CustomerFormData = {
  name: "",
  mainPhone: "",
  backupPhone: "",
  bundle: "",
  status: "normal",
};

export type CustomerFilter = "all" | "loyal" | "normal";
