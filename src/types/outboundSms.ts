import type { Timestamp } from "firebase/firestore";

export interface OutboundSms {
  id: string;
  customerId: string;
  phone: string;
  message: string;
  createdAt: Timestamp | null;
  sentAt: Timestamp | null;
}
