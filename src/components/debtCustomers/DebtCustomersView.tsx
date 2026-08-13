import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, Plus, Search, Wallet } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import {
  addDebtCustomer,
  deleteDebtCustomer,
  getDebtCustomersRealtime,
  updateDebtCustomer,
} from "../../services/debtCustomerService";
import type { DebtCustomer, DebtCustomerFormData } from "../../types/debtCustomer";
import DebtCustomerTable from "./DebtCustomerTable";
import DebtCustomerForm from "./DebtCustomerForm";
import ConfirmDialog from "../common/ConfirmDialog";

export default function DebtCustomersView() {
  const { t } = useLanguage();
  const [debtCustomers, setDebtCustomers] = useState<DebtCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingDebtCustomer, setEditingDebtCustomer] = useState<DebtCustomer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DebtCustomer | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = getDebtCustomersRealtime(
      (data) => {
        setDebtCustomers(data);
        setLoading(false);
        setLoadError(null);
      },
      (error) => {
        setLoadError(error.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return debtCustomers;
    return debtCustomers.filter(
      (dc) =>
        dc.name.toLowerCase().includes(term) ||
        dc.phone.toLowerCase().includes(term) ||
        dc.backupPhone.toLowerCase().includes(term)
    );
  }, [debtCustomers, search]);

  const totalDebt = useMemo(
    () => debtCustomers.reduce((sum, dc) => sum + dc.amount, 0),
    [debtCustomers]
  );

  function openAddForm() {
    setEditingDebtCustomer(null);
    setFormOpen(true);
  }

  function openEditForm(debtCustomer: DebtCustomer) {
    setEditingDebtCustomer(debtCustomer);
    setFormOpen(true);
  }

  async function handleFormSubmit(data: DebtCustomerFormData) {
    if (editingDebtCustomer) {
      await updateDebtCustomer(editingDebtCustomer.id, data);
    } else {
      await addDebtCustomer(data);
    }
    setFormOpen(false);
    setEditingDebtCustomer(null);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDebtCustomer(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const hasActiveFilters = search.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">{t.debtCustomersTitle}</h1>
        <p className="mt-0.5 text-sm text-ink-500">{t.debtCustomersSubtitle}</p>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-ink-100 bg-white p-4 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amtel-50 text-amtel-600">
          <Wallet size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-ink-900 tabular-nums">${totalDebt.toFixed(2)}</p>
          <p className="truncate text-xs font-medium text-ink-500">{t.totalDebt}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.debtSearchPlaceholder}
            className="w-full rounded-lg border border-ink-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
          />
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-lg bg-amtel-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amtel-700"
        >
          <Plus size={16} />
          {t.addDebtCustomer}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-ink-100 bg-white py-20">
          <Loader2 size={24} className="animate-spin text-amtel-600" />
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-amtel-200 bg-amtel-50 py-16 text-center">
          <AlertTriangle size={22} className="text-amtel-600" />
          <p className="font-medium text-amtel-700">{t.couldntLoadDebtCustomers}</p>
          <p className="max-w-sm text-sm text-amtel-600">{loadError}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-300 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amtel-50 text-amtel-600">
            <Wallet size={22} />
          </div>
          <p className="font-medium text-ink-900">
            {hasActiveFilters ? t.debtEmptyFilteredTitle : t.debtEmptyTitle}
          </p>
          <p className="max-w-xs text-sm text-ink-500">
            {hasActiveFilters ? t.debtEmptyFilteredSubtitle : t.debtEmptySubtitle}
          </p>
          {!hasActiveFilters && (
            <button
              onClick={openAddForm}
              className="mt-1 rounded-lg bg-amtel-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amtel-700"
            >
              {t.addDebtCustomer}
            </button>
          )}
        </div>
      ) : (
        <DebtCustomerTable
          debtCustomers={filtered}
          onEdit={openEditForm}
          onDelete={setDeleteTarget}
        />
      )}

      {formOpen && (
        <DebtCustomerForm
          debtCustomer={editingDebtCustomer}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setFormOpen(false);
            setEditingDebtCustomer(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={t.deleteDebtCustomerTitle}
          message={t.deleteDebtCustomerMessage(deleteTarget.name)}
          confirmLabel={t.delete}
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
