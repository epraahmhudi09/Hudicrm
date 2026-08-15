import type { Timestamp } from "firebase/firestore";

/**
 * One EVC top-up transaction, written by the SMS webhook alongside the
 * cumulative increment on the customer document. Flat/top-level (not a
 * customer subcollection) so date-ranged queries ("this week's top
 * spenders") need only Firestore's automatic single-field index on
 * createdAt, instead of a collection-group query + composite index.
 */
export interface Topup {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  createdAt: Timestamp | null;
}
