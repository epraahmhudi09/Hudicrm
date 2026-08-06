import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";
import LoginPage from "./components/auth/LoginPage";
import Navbar from "./components/layout/Navbar";
import StatsOverview from "./components/dashboard/StatsOverview";
import SearchFilterBar from "./components/customers/SearchFilterBar";
import CustomerTable from "./components/customers/CustomerTable";
import CustomerForm from "./components/customers/CustomerForm";
import EmptyState from "./components/common/EmptyState";
import ConfirmDialog from "./components/common/ConfirmDialog";
import {
  addCustomer,
  deleteCustomer,
  getCustomersRealtime,
  logActivity,
  toggleCustomerStatus,
  updateCustomer,
} from "./services/customerService";
import { daysUntilExpiry } from "./components/customers/ExpiryBadge";
import { exportCustomersToExcel } from "./utils/spreadsheetExport";
import type { Customer, CustomerFilter, CustomerFormData } from "./types/customer";

const ImportCustomersModal = lazy(() => import("./components/customers/ImportCustomersModal"));
const CustomerActivityModal = lazy(() => import("./components/customers/CustomerActivityModal"));

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-100">
      <Loader2 size={28} className="animate-spin text-amtel-600" />
    </div>
  );
}

const SuspenseModalFallback = (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50">
    <Loader2 size={28} className="animate-spin text-white" />
  </div>
);

function Dashboard() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
  const [exporting, setExporting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = getCustomersRealtime(
      (data) => {
        setCustomers(data);
        setLoadingCustomers(false);
        setLoadError(null);
      },
      (error) => {
        setLoadError(error.message);
        setLoadingCustomers(false);
      }
    );
    return unsubscribe;
  }, []);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "expiring"
          ? (() => {
              const days = daysUntilExpiry(customer.bundleExpiry);
              return days !== null && days <= 7;
            })()
          : customer.status === filter);
      if (!matchesFilter) return false;

      if (!term) return true;
      return (
        customer.name.toLowerCase().includes(term) ||
        customer.mainPhone.toLowerCase().includes(term) ||
        customer.backupPhone.toLowerCase().includes(term)
      );
    });
  }, [customers, search, filter]);

  function openAddForm() {
    setEditingCustomer(null);
    setFormOpen(true);
  }

  function openEditForm(customer: Customer) {
    setEditingCustomer(customer);
    setFormOpen(true);
  }

  async function handleFormSubmit(data: CustomerFormData, createdAt?: Date) {
    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, data);
      await logActivity(editingCustomer.id, "updated", t.activityUpdated);
    } else {
      const newId = await addCustomer(data, createdAt);
      await logActivity(newId, "created", t.activityCreated);
    }
    setFormOpen(false);
    setEditingCustomer(null);
  }

  async function handleToggleStatus(customer: Customer) {
    setTogglingId(customer.id);
    try {
      const nextStatus = await toggleCustomerStatus(customer.id, customer.status);
      const label = nextStatus === "loyal" ? t.statusLoyal : t.statusNormal;
      await logActivity(customer.id, "status_change", t.activityStatusChanged(label));
    } finally {
      setTogglingId(null);
    }
  }

  function handleCallLogged(customer: Customer, phone: string) {
    void logActivity(customer.id, "call", t.activityCalled(phone));
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCustomer(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      await exportCustomersToExcel(filteredCustomers);
    } finally {
      setExporting(false);
    }
  }

  const hasActiveFilters = search.trim().length > 0 || filter !== "all";

  return (
    <div className="min-h-screen bg-ink-100">
      <Navbar />

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6">
        <StatsOverview customers={customers} />

        <SearchFilterBar
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          onAddCustomer={openAddForm}
          onImportCustomers={() => setImportOpen(true)}
          onExportCustomers={() => void handleExport()}
          exporting={exporting}
        />

        {loadingCustomers ? (
          <div className="flex items-center justify-center rounded-xl border border-ink-100 bg-white py-20">
            <Loader2 size={24} className="animate-spin text-amtel-600" />
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-amtel-200 bg-amtel-50 py-16 text-center">
            <AlertTriangle size={22} className="text-amtel-600" />
            <p className="font-medium text-amtel-700">{t.couldntLoadCustomers}</p>
            <p className="max-w-sm text-sm text-amtel-600">{loadError}</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} onAddCustomer={openAddForm} />
        ) : (
          <CustomerTable
            customers={filteredCustomers}
            onEdit={openEditForm}
            onDelete={setDeleteTarget}
            onToggleStatus={handleToggleStatus}
            onViewHistory={setHistoryCustomer}
            onCallLogged={handleCallLogged}
            togglingId={togglingId}
          />
        )}
      </main>

      {formOpen && (
        <CustomerForm
          customer={editingCustomer}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setFormOpen(false);
            setEditingCustomer(null);
          }}
        />
      )}

      {importOpen && (
        <Suspense fallback={SuspenseModalFallback}>
          <ImportCustomersModal onClose={() => setImportOpen(false)} />
        </Suspense>
      )}

      {historyCustomer && (
        <Suspense fallback={SuspenseModalFallback}>
          <CustomerActivityModal
            customer={historyCustomer}
            onClose={() => setHistoryCustomer(null)}
          />
        </Suspense>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={t.deleteCustomerTitle}
          message={t.deleteCustomerMessage(deleteTarget.name)}
          confirmLabel={t.delete}
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;
  if (!user) return <LoginPage />;

  return <Dashboard />;
}
