import ExcelJS from "exceljs";
import { parseCsv, parseXlsx } from "./spreadsheetImport";

export interface ParsedBroadcastRow {
  name: string;
  phone: string;
}

const NAME_HEADERS = new Set(["name", "customername", "fullname"]);
const PHONE_HEADERS = new Set([
  "phone",
  "phonenumber",
  "mainphone",
  "whatsapp",
  "whatsappnumber",
  "number",
]);

function normalizeHeader(header: unknown): string {
  return String(header).toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function parseBroadcastContactsFile(file: File): Promise<ParsedBroadcastRow[]> {
  const isCsv = file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";
  const table = isCsv ? parseCsv(await file.text()) : await parseXlsx(await file.arrayBuffer());
  if (table.length === 0) return [];

  const [headerRow, ...dataRows] = table;
  const nameIndex = headerRow.findIndex((h) => NAME_HEADERS.has(normalizeHeader(h)));
  const phoneIndex = headerRow.findIndex((h) => PHONE_HEADERS.has(normalizeHeader(h)));

  return dataRows
    .filter((row) => row.some((cell) => String(cell).trim() !== ""))
    .map((row) => ({
      name: nameIndex >= 0 ? String(row[nameIndex] ?? "").trim() : "",
      phone: phoneIndex >= 0 ? String(row[phoneIndex] ?? "").trim() : "",
    }))
    .filter((row) => row.name && row.phone);
}

export async function downloadBroadcastTemplate(): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Contacts");

  sheet.addRow(["Name", "Phone"]);
  sheet.addRow(["Amina Yusuf", "717701253"]);
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
