import type { CustomerFormData, CustomerStatus } from "../types/customer";
import type { Bundle } from "../types/bundle";
import { normalizePhone } from "./phone";

export const PHONE_PATTERN = /^[+]?[0-9\s\-()]{7,20}$/;

export interface CustomerRowInput {
  name: string;
  mainPhone: string;
  backupPhone: string;
  bundle: string;
  status: string;
  createdAt: string | Date;
  bundleExpiry: string | Date;
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

/** Formats a Date as a yyyy-mm-dd input value using local calendar date, not UTC. */
function dateToInputValue(date: Date): string {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
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

  const bundleExpiryDate = parseRowDate(input.bundleExpiry);

  return {
    data: {
      name,
      mainPhone,
      backupPhone,
      bundle,
      status: normalizeStatus(input.status),
      bundleExpiry: bundleExpiryDate ? dateToInputValue(bundleExpiryDate) : "",
      bundleId,
    },
    createdAt: parseRowDate(input.createdAt),
    errors,
    assignedBundleMatched,
  };
}

/**
 * Flags rows whose phone number is already registered — either by an existing
 * customer or by an earlier row in the same file. Only rows that are otherwise
 * valid and not themselves duplicates "reserve" their number, so when the same
 * number appears twice in a file, the first occurrence imports and later ones
 * are flagged (rather than every occurrence flagging each other).
 */
export function flagDuplicatePhones<T extends { mainPhone: string; backupPhone: string }>(
  rows: ValidatedCustomerRow[],
  existingCustomers: T[]
): ValidatedCustomerRow[] {
  const takenPhones = new Set<string>();
  for (const c of existingCustomers) {
    const main = normalizePhone(c.mainPhone);
    if (main) takenPhones.add(main);
    const backup = normalizePhone(c.backupPhone);
    if (backup) takenPhones.add(backup);
  }

  const seenInFile = new Set<string>();

  return rows.map((row) => {
    const main = normalizePhone(row.data.mainPhone);
    const backup = normalizePhone(row.data.backupPhone);
    const isDuplicate =
      (main !== "" && (takenPhones.has(main) || seenInFile.has(main))) ||
      (backup !== "" && (takenPhones.has(backup) || seenInFile.has(backup)));

    if (isDuplicate) {
      return { ...row, errors: [...row.errors, "Duplicate phone number — already registered."] };
    }

    if (row.errors.length === 0) {
      if (main) seenInFile.add(main);
      if (backup) seenInFile.add(backup);
    }
    return row;
  });
}
