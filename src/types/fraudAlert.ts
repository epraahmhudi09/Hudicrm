import type { Timestamp } from "firebase/firestore";

export type FraudAlertReason =
  | "duplicate_transaction"
  | "balance_increased_after_sale"
  | "backdated_timestamp";

export interface FraudAlert {
  id: string;
  tenantId: string;
  transactionId: string;
  phone: string;
  amount: number;
  newBalance: number;
  reasons: FraudAlertReason[];
  detectedAt: Timestamp | null;
  reviewed: boolean;
}
