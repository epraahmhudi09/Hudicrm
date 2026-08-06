import { Pencil, Trash2, Star, RefreshCw, Phone } from "lucide-react";
import type { Customer } from "../../types/customer";
import StatusBadge from "./StatusBadge";
import CustomerCard from "./CustomerCard";
import { telHref } from "../../utils/phone";
import { useLanguage } from "../../context/LanguageContext";

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onToggleStatus: (customer: Customer) => void;
  togglingId: string | null;
}

function formatDate(customer: Customer): string {
  const date = customer.createdAt?.toDate();
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CustomerTable({
  customers,
  onEdit,
  onDelete,
  onToggleStatus,
  togglingId,
}: CustomerTableProps) {
  const { t } = useLanguage();
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">{t.colName}</th>
                <th className="px-4 py-3">{t.colMainPhone}</th>
                <th className="px-4 py-3">{t.colBackupPhone}</th>
                <th className="px-4 py-3">{t.colBundle}</th>
                <th className="px-4 py-3">{t.colStatus}</th>
                <th className="px-4 py-3">{t.colCreated}</th>
                <th className="px-4 py-3 text-right">{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="transition hover:bg-ink-100/40">
                  <td className="px-4 py-3 font-medium text-ink-900">{customer.name}</td>
                  <td className="px-4 py-3">
                    <a
                      href={telHref(customer.mainPhone)}
                      className="flex items-center gap-1.5 text-ink-700 transition hover:text-amtel-600 hover:underline"
                    >
                      <Phone size={13} className="text-amtel-600" />
                      {customer.mainPhone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-ink-500">
                    {customer.backupPhone ? (
                      <a
                        href={telHref(customer.backupPhone)}
                        className="flex items-center gap-1.5 transition hover:text-amtel-600 hover:underline"
                      >
                        <Phone size={13} />
                        {customer.backupPhone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{customer.bundle}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={customer.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-500">
                    {formatDate(customer)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onToggleStatus(customer)}
                        disabled={togglingId === customer.id}
                        title={customer.status === "loyal" ? t.actionMarkNormal : t.actionMarkLoyal}
                        className="rounded-lg p-1.5 text-ink-500 transition hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50"
                      >
                        {togglingId === customer.id ? (
                          <RefreshCw size={15} className="animate-spin" />
                        ) : (
                          <Star size={15} />
                        )}
                      </button>
                      <button
                        onClick={() => onEdit(customer)}
                        title={t.actionEdit}
                        className="rounded-lg p-1.5 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(customer)}
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
        {customers.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </div>
    </>
  );
}
