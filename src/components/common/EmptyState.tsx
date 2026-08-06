import { Users, SearchX } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface EmptyStateProps {
  hasFilters: boolean;
  onAddCustomer: () => void;
}

export default function EmptyState({ hasFilters, onAddCustomer }: EmptyStateProps) {
  const { t } = useLanguage();

  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-300 bg-white py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-500">
          <SearchX size={22} />
        </div>
        <p className="font-medium text-ink-900">{t.emptyFilteredTitle}</p>
        <p className="max-w-xs text-sm text-ink-500">{t.emptyFilteredSubtitle}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-300 bg-white py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amtel-50 text-amtel-600">
        <Users size={22} />
      </div>
      <p className="font-medium text-ink-900">{t.emptyTitle}</p>
      <p className="max-w-xs text-sm text-ink-500">{t.emptySubtitle}</p>
      <button
        onClick={onAddCustomer}
        className="mt-1 rounded-lg bg-amtel-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amtel-700"
      >
        {t.addCustomer}
      </button>
    </div>
  );
}
