import type { Timestamp } from "firebase/firestore";

export interface DebtCustomer {
  id: string;
  name: string;
  phone: string;
  backupPhone: string;
  amount: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface DebtCustomerFormData {
  name: string;
  phone: string;
  backupPhone: string;
  /** Plain string form input, parsed to a number before it's sent to Firestore. */
  amount: string;
}

export const EMPTY_DEBT_CUSTOMER_FORM: DebtCustomerFormData = {
  name: "",
  phone: "",
  backupPhone: "",
  amount: "",
};
