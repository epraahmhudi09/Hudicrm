import { Pencil, Trash2, Star, Phone, PhoneCall } from "lucide-react";
import type { Customer } from "../../types/customer";
import StatusBadge from "./StatusBadge";
import { telHref } from "../../utils/phone";
import { useLanguage } from "../../context/LanguageContext";

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onToggleStatus: (customer: Customer) => void;
}

export default function CustomerCard({
  customer,
  onEdit,
  onDelete,
  onToggleStatus,
}: CustomerCardProps) {
  const { t } = useLanguage();
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink-900">{customer.name}</p>
          <p className="mt-0.5 text-xs text-ink-500">{customer.bundle}</p>
        </div>
        <StatusBadge status={customer.status} />
      </div>

      <div className="mt-3 space-y-1.5 text-sm">
        <a
          href={telHref(customer.mainPhone)}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 text-ink-700 transition hover:text-amtel-600"
        >
          <Phone size={14} className="text-amtel-600" />
          <span className="underline-offset-2 hover:underline">{customer.mainPhone}</span>
        </a>
        {customer.backupPhone && (
          <a
            href={telHref(customer.backupPhone)}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 text-ink-500 transition hover:text-amtel-600"
          >
            <PhoneCall size={14} />
            <span className="underline-offset-2 hover:underline">{customer.backupPhone}</span>
          </a>
        )}
      </div>

      <div className="mt-4 flex items-center justify-end gap-1 border-t border-ink-100 pt-3">
        <button
          onClick={() => onToggleStatus(customer)}
          title={customer.status === "loyal" ? t.actionMarkNormal : t.actionMarkLoyal}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-600 transition hover:bg-ink-100"
        >
          <Star size={14} />
          {t.actionToggle}
        </button>
        <button
          onClick={() => onEdit(customer)}
          title={t.actionEdit}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-600 transition hover:bg-ink-100"
        >
          <Pencil size={14} />
          {t.actionEdit}
        </button>
        <button
          onClick={() => onDelete(customer)}
          title={t.actionDelete}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-amtel-600 transition hover:bg-amtel-50"
        >
          <Trash2 size={14} />
          {t.actionDelete}
        </button>
      </div>
    </div>
  );
}
