import { Pencil, Trash2 } from "lucide-react";
import type { Bundle } from "../../types/bundle";
import { useLanguage } from "../../context/LanguageContext";
import type { Translations } from "../../i18n/translations";

interface BundleTableProps {
  bundles: Bundle[];
  onEdit: (bundle: Bundle) => void;
  onDelete: (bundle: Bundle) => void;
}

export function formatDuration(bundle: Bundle, t: Translations): string {
  const unitLabel =
    bundle.durationUnit === "hours"
      ? t.durationUnitHours
      : bundle.durationUnit === "days"
        ? t.durationUnitDays
        : t.durationUnitMonths;
  return `${bundle.durationValue} ${unitLabel.toLowerCase()}`;
}

export default function BundleTable({ bundles, onEdit, onDelete }: BundleTableProps) {
  const { t } = useLanguage();
  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-100/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3">{t.bundleColName}</th>
              <th className="px-4 py-3">{t.bundleColPrice}</th>
              <th className="px-4 py-3">{t.bundleColDuration}</th>
              <th className="px-4 py-3 text-right">{t.bundleColActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {bundles.map((bundle) => (
              <tr key={bundle.id} className="transition hover:bg-ink-100/40">
                <td className="px-4 py-3 font-medium text-ink-900">{bundle.name || "—"}</td>
                <td className="px-4 py-3 font-semibold text-amtel-700">
                  ${bundle.amount.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-ink-700">{formatDuration(bundle, t)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(bundle)}
                      title={t.actionEdit}
                      className="rounded-lg p-1.5 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(bundle)}
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
  );
}
