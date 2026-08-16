import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Loader2, AlertTriangle, Bell, X } from "lucide-react";
import { useAuth, useTenantId } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";
import LoginPage from "./components/auth/LoginPage";
import Navbar from "./components/layout/Navbar";
import Sidebar, { type AppView } from "./components/layout/Sidebar";
import DebtCustomersView from "./components/debtCustomers/DebtCustomersView";
import ExpiredBundlesView from "./components/expiredBundles/ExpiredBundlesView";
import BundlesView from "./components/bundles/BundlesView";
import AnalyticsView from "./components/analytics/AnalyticsView";
import SmsRemindersView from "./components/smsReminders/SmsRemindersView";
import EscalationsView from "./components/escalations/EscalationsView";
import DownloadAppsView from "./components/downloadApps/DownloadAppsView";
import UsersView from "./components/admin/UsersView";
import DashboardView from "./components/dashboard/DashboardView";
import SettingsView from "./components/settings/SettingsView";
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
import { listenForForegroundMessages } from "./utils/pushNotifications";
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
  const { isPlatformAdmin } = useAuth();
  const tenantId = useTenantId();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<AppView>("dashboard");
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
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    const unsubscribe = listenForForegroundMessages((title, body) => {
      setToast({ title, body });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 8000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const unsubscribe = getCustomersRealtime(
      tenantId,
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
  }, [tenantId]);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    const matched = customers.filter((customer) => {
      const matchesFilter =
        filter === "all" || filter === "az" || filter === "expiry"
          ? true
          : filter === "expiring"
            ? (() => {
                const days = daysUntilExpiry(customer.bundleExpiry);
                return days !== null && days <= 7;
              })()
            : customer.status === filter;
      if (!matchesFilter) return false;

      if (!term) return true;
      return (
        customer.name.toLowerCase().includes(term) ||
        customer.mainPhone.toLowerCase().includes(term) ||
        customer.backupPhone.toLowerCase().includes(term)
      );
    });

    if (filter === "az") {
      return [...matched].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (filter === "expiry") {
      return [...matched].sort((a, b) => {
        const aTime = a.bundleExpiry?.toDate().getTime() ?? Infinity;
        const bTime = b.bundleExpiry?.toDate().getTime() ?? Infinity;
        return aTime - bTime;
      });
    }
    return matched;
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
      const newId = await addCustomer(tenantId, data, createdAt);
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
      <Navbar
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onOpenSettings={() => setView("settings")}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        view={view}
        onNavigate={setView}
        isPlatformAdmin={isPlatformAdmin}
      />

      {toast && (
        <div className="fixed right-4 top-20 z-50 flex w-full max-w-sm items-start gap-3 rounded-xl border border-ink-100 bg-white p-4 shadow-lg">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amtel-50 text-amtel-600">
            <Bell size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink-900">{toast.title}</p>
            <p className="mt-0.5 text-sm text-ink-500">{toast.body}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="rounded-lg p-1 text-ink-500 transition hover:bg-ink-100"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6">
        {view === "dashboard" ? (
          <DashboardView />
        ) : view === "settings" ? (
          <SettingsView />
        ) : view === "customers" ? (
          <>
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
          </>
        ) : view === "debtCustomers" ? (
          <DebtCustomersView />
        ) : view === "expiredBundles" ? (
          <ExpiredBundlesView />
        ) : view === "smsReminders" ? (
          <SmsRemindersView />
        ) : view === "escalations" ? (
          <EscalationsView />
        ) : view === "bundles" ? (
          <BundlesView />
        ) : view === "downloadApps" ? (
          <DownloadAppsView />
        ) : view === "users" && isPlatformAdmin ? (
          <UsersView />
        ) : (
          <AnalyticsView />
        )}
      </main>

      {formOpen && (
        <CustomerForm
          customer={editingCustomer}
          existingCustomers={customers}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setFormOpen(false);
            setEditingCustomer(null);
          }}
        />
      )}

      {importOpen && (
        <Suspense fallback={SuspenseModalFallback}>
          <ImportCustomersModal
            existingCustomers={customers}
            onClose={() => setImportOpen(false)}
          />
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

function AccountNotSetUp() {
  const { t } = useLanguage();
  const { logout } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ink-100 px-4 text-center">
      <AlertTriangle size={28} className="text-amtel-600" />
      <p className="max-w-sm font-medium text-ink-900">{t.accountNotSetUp}</p>
      <button
        onClick={() => void logout()}
        className="rounded-lg bg-amtel-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amtel-700"
      >
        {t.signOut}
      </button>
    </div>
  );
}

export default function App() {
  const { user, loading, profileLoading, tenantId } = useAuth();

  if (loading) return <FullScreenLoader />;
  if (!user) return <LoginPage />;
  if (profileLoading) return <FullScreenLoader />;
  if (!tenantId) return <AccountNotSetUp />;

  return <Dashboard />;
}
