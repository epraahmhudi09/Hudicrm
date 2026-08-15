import { Search, Plus, ListFilter, Upload, Download, Loader2 } from "lucide-react";
import type { CustomerFilter } from "../../types/customer";
import { useLanguage } from "../../context/LanguageContext";

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: CustomerFilter;
  onFilterChange: (value: CustomerFilter) => void;
  onAddCustomer: () => void;
  onImportCustomers: () => void;
  onExportCustomers: () => void;
  exporting: boolean;
}

export default function SearchFilterBar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onAddCustomer,
  onImportCustomers,
  onExportCustomers,
  exporting,
}: SearchFilterBarProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-lg border border-ink-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
          />
        </div>

        <div className="relative">
          <ListFilter
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
          />
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value as CustomerFilter)}
            className="appearance-none rounded-lg border border-ink-300 bg-white py-2.5 pl-8 pr-8 text-sm text-ink-700 outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
          >
            <option value="all">{t.filterAll}</option>
            <option value="loyal">{t.filterLoyalOnly}</option>
            <option value="normal">{t.filterNormalOnly}</option>
            <option value="expiring">{t.filterExpiring}</option>
            <option value="az">{t.filterAlphabetical}</option>
            <option value="expiry">{t.filterByExpiry}</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onExportCustomers}
          disabled={exporting}
          title={t.export}
          className="flex items-center justify-center gap-2 rounded-lg border border-ink-300 bg-white px-3 py-2.5 text-sm font-semibold text-ink-700 shadow-sm transition hover:bg-ink-100 disabled:opacity-60"
        >
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        </button>
        <button
          onClick={onImportCustomers}
          className="flex items-center justify-center gap-2 rounded-lg border border-ink-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 shadow-sm transition hover:bg-ink-100"
        >
          <Upload size={16} />
          {t.import}
        </button>
        <button
          onClick={onAddCustomer}
          className="flex items-center justify-center gap-2 rounded-lg bg-amtel-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amtel-700"
        >
          <Plus size={16} />
          {t.addCustomer}
        </button>
      </div>
    </div>
  );
}
