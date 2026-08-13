import { Pencil, Trash2, Phone } from "lucide-react";
import type { DebtCustomer } from "../../types/debtCustomer";
import { telHref } from "../../utils/phone";
import { useLanguage } from "../../context/LanguageContext";

interface DebtCustomerTableProps {
  debtCustomers: DebtCustomer[];
  onEdit: (debtCustomer: DebtCustomer) => void;
  onDelete: (debtCustomer: DebtCustomer) => void;
}

function formatAmount(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function formatDate(debtCustomer: DebtCustomer): string {
  const date = debtCustomer.createdAt?.toDate();
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DebtCustomerTable({
  debtCustomers,
  onEdit,
  onDelete,
}: DebtCustomerTableProps) {
  const { t } = useLanguage();
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">{t.debtColName}</th>
                <th className="px-4 py-3">{t.debtColPhone}</th>
                <th className="px-4 py-3">{t.debtColBackupPhone}</th>
                <th className="px-4 py-3">{t.debtColAmount}</th>
                <th className="px-4 py-3">{t.debtColCreated}</th>
                <th className="px-4 py-3 text-right">{t.debtColActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {debtCustomers.map((dc) => (
                <tr key={dc.id} className="transition hover:bg-ink-100/40">
                  <td className="px-4 py-3 font-medium text-ink-900">{dc.name}</td>
                  <td className="px-4 py-3">
                    <a
                      href={telHref(dc.phone)}
                      className="flex items-center gap-1.5 text-ink-700 transition hover:text-amtel-600 hover:underline"
                    >
                      <Phone size={13} className="text-amtel-600" />
                      {dc.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-ink-500">
                    {dc.backupPhone ? (
                      <a
                        href={telHref(dc.backupPhone)}
                        className="flex items-center gap-1.5 transition hover:text-amtel-600 hover:underline"
                      >
                        <Phone size={13} />
                        {dc.backupPhone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-amtel-700">
                    {formatAmount(dc.amount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-500">{formatDate(dc)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(dc)}
                        title={t.actionEdit}
                        className="rounded-lg p-1.5 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(dc)}
                        title={t.actionDelete}
                        className="rounded-lg p-1.5 text-ink-500 transition hover:bg-amtel-50 hover:text-amtel-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
        {debtCustomers.map((dc) => (
          <div key={dc.id} className="rounded-xl border border-ink-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink-900">{dc.name}</p>
                <a
                  href={telHref(dc.phone)}
                  className="mt-1 flex items-center gap-1.5 text-sm text-ink-700 hover:text-amtel-600 hover:underline"
                >
                  <Phone size={13} className="text-amtel-600" />
                  {dc.phone}
                </a>
                {dc.backupPhone && (
                  <a
                    href={telHref(dc.backupPhone)}
                    className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-500 hover:text-amtel-600 hover:underline"
                  >
                    <Phone size={13} />
                    {dc.backupPhone}
                  </a>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => onEdit(dc)}
                  title={t.actionEdit}
                  className="rounded-lg p-1.5 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => onDelete(dc)}
                  title={t.actionDelete}
                  className="rounded-lg p-1.5 text-ink-500 transition hover:bg-amtel-50 hover:text-amtel-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
              <span className="text-xs text-ink-500">{formatDate(dc)}</span>
              <span className="font-semibold text-amtel-700">{formatAmount(dc.amount)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
