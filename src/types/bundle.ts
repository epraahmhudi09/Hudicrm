import type { Timestamp } from "firebase/firestore";
import type { DurationUnit } from "../utils/parseEvcSms";

export type { DurationUnit };

export interface Bundle {
  id: string;
  /** Friendly package name, e.g. "Unlimited". Optional — purely for staff readability. */
  name: string;
  amount: number;
  durationValue: number;
  durationUnit: DurationUnit;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface BundleFormData {
  name: string;
  amount: string;
  durationValue: string;
  durationUnit: DurationUnit;
}

export const EMPTY_BUNDLE_FORM: BundleFormData = {
  name: "",
  amount: "",
  durationValue: "",
  durationUnit: "hours",
};
