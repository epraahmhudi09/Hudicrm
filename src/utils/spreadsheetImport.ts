import ExcelJS from "exceljs";
import {
  validateCustomerRow,
  type CustomerRowInput,
  type ValidatedCustomerRow,
} from "./customerValidation";

export const IMPORT_TEMPLATE_HEADERS = [
  "Name",
  "Main Phone",
  "Backup Phone",
  "Bundle",
  "Status",
  "Created Date",
];

const HEADER_ALIASES: Record<string, keyof CustomerRowInput> = {
  name: "name",
  customername: "name",
  fullname: "name",
  mainphone: "mainPhone",
  phone: "mainPhone",
  phonenumber: "mainPhone",
  mainphonenumber: "mainPhone",
  primaryphone: "mainPhone",
  backupphone: "backupPhone",
  alternativephone: "backupPhone",
  secondaryphone: "backupPhone",
  altphone: "backupPhone",
  bundle: "bundle",
  plan: "bundle",
  subscription: "bundle",
  package: "bundle",
  status: "status",
  createdat: "createdAt",
  createddate: "createdAt",
  date: "createdAt",
  joindate: "createdAt",
  signupdate: "createdAt",
};

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function cellToPrimitive(value: ExcelJS.CellValue): string | Date {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value;
  if (typeof value === "object") {
    if ("richText" in value) {
      return (value.richText as Array<{ text: string }>).map((t) => t.text).join("");
    }
    if ("text" in value) return String((value as { text: unknown }).text);
    if ("result" in value) {
      return cellToPrimitive((value as { result: ExcelJS.CellValue }).result);
    }
    return "";
  }
  return String(value);
}

async function parseXlsx(buffer: ArrayBuffer): Promise<(string | Date)[][]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const table: (string | Date)[][] = [];
  worksheet.eachRow({ includeEmpty: false }, (row) => {
    const values = row.values as ExcelJS.CellValue[];
    table.push(values.slice(1).map(cellToPrimitive));
  });
  return table;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }

  return rows;
}

function tableToValidatedRows(table: (string | Date)[][]): ValidatedCustomerRow[] {
  if (table.length === 0) return [];
  const [headerRow, ...dataRows] = table;
  const keys: Array<keyof CustomerRowInput | null> = headerRow.map(
    (h) => HEADER_ALIASES[normalizeHeader(String(h))] ?? null
  );

  return dataRows
    .filter((row) => row.some((cell) => String(cell).trim() !== ""))
    .map((row) => {
      const input: CustomerRowInput = {
        name: "",
        mainPhone: "",
        backupPhone: "",
        bundle: "",
        status: "",
        createdAt: "",
      };

      row.forEach((cell, i) => {
        const key = keys[i];
        if (!key) return;
        if (key === "createdAt") {
          input.createdAt = cell;
        } else {
          input[key] = String(cell);
        }
      });

      return validateCustomerRow(input);
    });
}

export async function parseSpreadsheetFile(file: File): Promise<ValidatedCustomerRow[]> {
  const isCsv = file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";
  const table = isCsv ? parseCsv(await file.text()) : await parseXlsx(await file.arrayBuffer());
  return tableToValidatedRows(table);
}

export async function downloadImportTemplate(): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Customers");

  sheet.addRow(IMPORT_TEMPLATE_HEADERS);
  sheet.addRow([
    "Amina Yusuf",
    "+252 61 234 5678",
    "+252 61 999 0001",
    "VIP Pro",
    "loyal",
    "2026-01-15",
  ]);
  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((col) => {
    col.width = 20;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "amtel-customers-template.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
