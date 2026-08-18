import ExcelJS from "exceljs";
import { parseCsv, parseXlsx } from "./spreadsheetImport";
import type { Bundle } from "../types/bundle";

export interface ParsedBroadcastRow {
  name: string;
  mainPhone: string;
  backupPhone: string;
  bundleId: string | null;
}

const NAME_HEADERS = new Set(["name", "customername", "fullname"]);
const MAIN_PHONE_HEADERS = new Set([
  "phone",
  "mainphone",
  "mainphonenumber",
  "whatsapp",
  "whatsappnumber",
  "number",
  "primaryphone",
]);
const BACKUP_PHONE_HEADERS = new Set([
  "backupphone",
  "alternativephone",
  "secondaryphone",
  "altphone",
]);
const BUNDLE_HEADERS = new Set(["assignedbundle", "bundleassigned", "assigned", "bundle"]);

function normalizeHeader(header: unknown): string {
  return String(header).toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Loose match ("Bulaal Lite (60hrs)" vs "Bulaal Lite 60hrs") — strips everything but letters/digits before comparing. */
function normalizeForBundleMatch(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function resolveBundleId(bundleText: string, bundles: Bundle[]): string | null {
  const trimmed = bundleText.trim();
  if (!trimmed) return null;
  const target = normalizeForBundleMatch(trimmed);
  const match = bundles.find((b) => normalizeForBundleMatch(b.name) === target);
  return match?.id ?? null;
}

export async function parseBroadcastContactsFile(
  file: File,
  bundles: Bundle[]
): Promise<ParsedBroadcastRow[]> {
  const isCsv = file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";
  const table = isCsv ? parseCsv(await file.text()) : await parseXlsx(await file.arrayBuffer());
  if (table.length === 0) return [];

  const [headerRow, ...dataRows] = table;
  const nameIndex = headerRow.findIndex((h) => NAME_HEADERS.has(normalizeHeader(h)));
  const mainPhoneIndex = headerRow.findIndex((h) => MAIN_PHONE_HEADERS.has(normalizeHeader(h)));
  const backupPhoneIndex = headerRow.findIndex((h) => BACKUP_PHONE_HEADERS.has(normalizeHeader(h)));
  const bundleIndex = headerRow.findIndex((h) => BUNDLE_HEADERS.has(normalizeHeader(h)));

  return dataRows
    .filter((row) => row.some((cell) => String(cell).trim() !== ""))
    .map((row) => ({
      name: nameIndex >= 0 ? String(row[nameIndex] ?? "").trim() : "",
      mainPhone: mainPhoneIndex >= 0 ? String(row[mainPhoneIndex] ?? "").trim() : "",
      backupPhone: backupPhoneIndex >= 0 ? String(row[backupPhoneIndex] ?? "").trim() : "",
      bundleId:
        bundleIndex >= 0 ? resolveBundleId(String(row[bundleIndex] ?? ""), bundles) : null,
    }))
    .filter((row) => row.name && row.mainPhone);
}

export async function downloadBroadcastTemplate(): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Contacts");

  sheet.addRow(["Name", "Main Phone", "Backup Phone", "Assigned Bundle"]);
  sheet.addRow(["Amina Yusuf", "717701253", "907701253", "Bulaal Lite (60hrs)"]);
  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((col) => {
    col.width = 24;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "whatsapp-broadcast-template.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
