import { useState, type ChangeEvent } from "react";
import {
  X,
  UploadCloud,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";
import { bulkAddCustomers } from "../../services/customerService";
import { downloadImportTemplate, parseSpreadsheetFile } from "../../utils/spreadsheetImport";
import type { ValidatedCustomerRow } from "../../utils/customerValidation";
import StatusBadge from "./StatusBadge";

interface ImportCustomersModalProps {
  onClose: () => void;
}

type Stage = "pick" | "preview" | "importing" | "done";

export default function ImportCustomersModal({ onClose }: ImportCustomersModalProps) {
  const [stage, setStage] = useState<Stage>("pick");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ValidatedCustomerRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);

  const validRows = rows.filter((r) => r.errors.length === 0);
  const invalidCount = rows.length - validRows.length;

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setFileName(file.name);
    setParseError(null);

    try {
      const parsed = await parseSpreadsheetFile(file);
      if (parsed.length === 0) {
        setParseError("No data rows found. Make sure the first row contains column headers.");
        return;
      }
      setRows(parsed);
      setStage("preview");
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : "Couldn't read that file. Try a .xlsx or .csv export."
      );
    }
  }

  async function handleImport() {
    if (validRows.length === 0) return;
    setStage("importing");
    try {
      const result = await bulkAddCustomers(
        validRows.map((r) => ({ data: r.data, createdAt: r.createdAt }))
      );
      setImportedCount(result.successCount);
      setStage("done");
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Import failed. Please try again.");
      setStage("preview");
    }
  }

  function reset() {
    setStage("pick");
    setRows([]);
    setFileName("");
    setParseError(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4"
      onClick={stage === "importing" ? undefined : onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-ink-900">Import Customers</h2>
          {stage !== "importing" && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {stage === "pick" && (
            <div className="space-y-4">
              <p className="text-sm text-ink-500">
                Upload an Excel (.xlsx) or CSV file to bulk-add customers. The first row must
                contain column headers — Name, Main Phone, Backup Phone, Bundle, Status, and
                Created Date are recognized automatically.
              </p>

              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-ink-300 bg-ink-100/50 px-6 py-10 text-center transition hover:border-amtel-400 hover:bg-amtel-50">
                <UploadCloud size={28} className="text-amtel-600" />
                <span className="text-sm font-medium text-ink-900">
                  Click to choose a file
                </span>
                <span className="text-xs text-ink-500">.xlsx or .csv</span>
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {parseError && (
                <div className="rounded-lg border border-amtel-200 bg-amtel-50 px-3 py-2.5 text-sm text-amtel-700">
                  {parseError}
                </div>
              )}

              <button
                type="button"
                onClick={() => void downloadImportTemplate()}
                className="flex items-center gap-2 text-sm font-medium text-amtel-600 transition hover:text-amtel-700"
              >
                <Download size={14} />
                Download a template spreadsheet
              </button>
            </div>
          )}

          {(stage === "preview" || stage === "importing") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-ink-700">
                  <FileSpreadsheet size={16} className="text-ink-500" />
                  <span className="font-medium">{fileName}</span>
                  <span className="text-ink-500">· {rows.length} rows</span>
                </div>
                {stage === "preview" && (
                  <button
                    onClick={reset}
                    className="text-xs font-medium text-ink-500 underline-offset-2 hover:underline"
                  >
                    Choose different file
                  </button>
                )}
              </div>

              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 font-medium text-green-700">
                  <CheckCircle2 size={12} /> {validRows.length} ready to import
                </span>
                {invalidCount > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-amtel-50 px-2.5 py-1 font-medium text-amtel-700">
                    <XCircle size={12} /> {invalidCount} will be skipped
                  </span>
                )}
              </div>

              {parseError && (
                <div className="rounded-lg border border-amtel-200 bg-amtel-50 px-3 py-2.5 text-sm text-amtel-700">
                  {parseError}
                </div>
              )}

              <div className="overflow-hidden rounded-lg border border-ink-100">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-ink-100/80 backdrop-blur">
                      <tr className="text-left text-[10px] uppercase tracking-wide text-ink-500">
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Main Phone</th>
                        <th className="px-3 py-2">Bundle</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Row</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {rows.map((row, i) => (
                        <tr key={i} className={row.errors.length > 0 ? "bg-amtel-50/50" : ""}>
                          <td className="px-3 py-2 font-medium text-ink-900">
                            {row.data.name || "—"}
                          </td>
                          <td className="px-3 py-2 text-ink-700">{row.data.mainPhone || "—"}</td>
                          <td className="px-3 py-2 text-ink-700">{row.data.bundle || "—"}</td>
                          <td className="px-3 py-2">
                            <StatusBadge status={row.data.status} />
                          </td>
                          <td className="px-3 py-2">
                            {row.errors.length > 0 ? (
                              <span className="flex items-center gap-1 text-amtel-600">
                                <XCircle size={12} />
                                {row.errors.join(" ")}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 size={12} />
                                Valid
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {stage === "done" && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                <CheckCircle2 size={24} />
              </div>
              <p className="font-medium text-ink-900">
                Imported {importedCount} customer{importedCount === 1 ? "" : "s"}
              </p>
              <p className="text-sm text-ink-500">
                They'll appear in your customer list right away.
              </p>
            </div>
          )}
        </div>

        {stage !== "pick" && stage !== "done" && (
          <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-4">
            <button
              onClick={onClose}
              disabled={stage === "importing"}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-ink-100 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={() => void handleImport()}
              disabled={stage === "importing" || validRows.length === 0}
              className="flex items-center gap-2 rounded-lg bg-amtel-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amtel-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {stage === "importing" && <Loader2 size={14} className="animate-spin" />}
              {stage === "importing"
                ? "Importing..."
                : `Import ${validRows.length} Customer${validRows.length === 1 ? "" : "s"}`}
            </button>
          </div>
        )}

        {stage === "done" && (
          <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-4">
            <button
              onClick={onClose}
              className="rounded-lg bg-amtel-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amtel-700"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
