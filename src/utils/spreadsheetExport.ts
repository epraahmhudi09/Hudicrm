import type { Customer } from "../types/customer";

function formatDate(ts: Customer["createdAt"]): string {
  return ts ? ts.toDate().toISOString().slice(0, 10) : "";
}

export async function exportCustomersToExcel(customers: Customer[]): Promise<void> {
  const { default: ExcelJS } = await import("exceljs");

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Customers");

  sheet.addRow([
    "Name",
    "Main Phone",
    "Backup Phone",
    "Bundle",
    "Status",
    "Bundle Expiry",
    "Created Date",
  ]);
  sheet.getRow(1).font = { bold: true };

  for (const customer of customers) {
    sheet.addRow([
      customer.name,
      customer.mainPhone,
      customer.backupPhone,
      customer.bundle,
      customer.status,
      formatDate(customer.bundleExpiry),
      formatDate(customer.createdAt),
    ]);
  }

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
  link.download = `amtel-customers-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
