import type { CustomerFormData, CustomerStatus } from "../types/customer";
import type { Bundle } from "../types/bundle";

export const PHONE_PATTERN = /^[+]?[0-9\s\-()]{7,20}$/;

export interface CustomerRowInput {
  name: string;
  mainPhone: string;
  backupPhone: string;
  bundle: string;
  status: string;
  createdAt: string | Date;
  /** Free-text bundle name from the spreadsheet, resolved by name against the live Bundles registry. */
  assignedBundle: string;
}

export interface ValidatedCustomerRow {
  data: CustomerFormData;
  createdAt: Date | null;
  errors: string[];
  /** false only when assignedBundle text was given but didn't match any registered bundle name. */
  assignedBundleMatched: boolean;
}

export function normalizeStatus(value: string): CustomerStatus {
  return value.trim().toLowerCase() === "loyal" ? "loyal" : "normal";
}

export function parseRowDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function validateCustomerRow(input: CustomerRowInput, bundles: Bundle[]): ValidatedCustomerRow {
  const errors: string[] = [];
  const name = input.name.trim();
  const mainPhone = input.mainPhone.trim();
  const backupPhone = input.backupPhone.trim();
  const bundle = input.bundle.trim();

  if (!name) errors.push("Name is required.");

  if (!mainPhone) {
    errors.push("Main phone is required.");
  } else if (!PHONE_PATTERN.test(mainPhone)) {
    errors.push("Main phone format looks invalid.");
  }

  if (backupPhone && !PHONE_PATTERN.test(backupPhone)) {
    errors.push("Backup phone format looks invalid.");
  }

  if (!bundle) errors.push("Bundle / plan is required.");

  const assignedBundleText = input.assignedBundle.trim();
  let bundleId = "";
  let assignedBundleMatched = true;
  if (assignedBundleText) {
    const match = bundles.find(
      (b) => b.name.trim().toLowerCase() === assignedBundleText.toLowerCase()
    );
    if (match) {
      bundleId = match.id;
    } else {
      assignedBundleMatched = false;
    }
  }

  return {
    data: {
      name,
      mainPhone,
      backupPhone,
      bundle,
      status: normalizeStatus(input.status),
      bundleExpiry: "",
      bundleId,
    },
    createdAt: parseRowDate(input.createdAt),
    errors,
    assignedBundleMatched,
  };
}
