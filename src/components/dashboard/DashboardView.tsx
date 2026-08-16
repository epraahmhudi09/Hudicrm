import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock,
  Loader2,
  Phone,
  ReceiptText,
  Star,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useLanguage } from "../../context/LanguageContext";
import { useTenantId } from "../../context/AuthContext";
import { getCustomersRealtime } from "../../services/customerService";
import { getDebtCustomersRealtime } from "../../services/debtCustomerService";
import { getRecentTopups } from "../../services/topupService";
import { daysUntilExpiry } from "../customers/ExpiryBadge";
import { telHref } from "../../utils/phone";
import type { Customer } from "../../types/customer";
import type { DebtCustomer } from "../../types/debtCustomer";
import type { Topup } from "../../types/topup";

const PIE_COLORS = ["#dc2626", "#64748b"];

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-ink-100 bg-white p-4 shadow-sm">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: accent + "1a", color: accent }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-ink-900 tabular-nums">{value}</p>
        <p className="truncate text-xs font-medium text-ink-500">{label}</p>
      </div>
    </div>
  );
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DashboardView() {
  const { t } = useLanguage();
  const tenantId = useTenantId();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [debtCustomers, setDebtCustomers] = useState<DebtCustomer[]>([]);
  const [recentTopups, setRecentTopups] = useState<Topup[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = getCustomersRealtime(
      tenantId,
      (data) => {
        setCustomers(data);
        setLoading(false);
        setLoadError(null);
      },
      (error) => {
        setLoadError(error.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [tenantId]);

  useEffect(() => {
    const unsubscribe = getDebtCustomersRealtime(tenantId, setDebtCustomers);
    return unsubscribe;
  }, [tenantId]);

  useEffect(() => {
    getRecentTopups(tenantId, 8)
      .then(setRecentTopups)
      .catch(() => setRecentTopups([]));
  }, [tenantId]);

  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalTopupAmount ?? 0), 0);
    const expiringSoon = customers.filter((c) => {
      const days = daysUntilExpiry(c.bundleExpiry);
      return days !== null && days >= 0 && days <= 7;
    }).length;
    const totalDebt = debtCustomers.reduce((sum, d) => sum + d.amount, 0);

    const loyal = customers.filter((c) => c.status === "loyal").length;
    const normal = totalCustomers - loyal;

    const topCustomer = [...customers]
      .filter((c) => (c.totalTopupAmount ?? 0) > 0)
      .sort((a, b) => (b.totalTopupAmount ?? 0) - (a.totalTopupAmount ?? 0))[0];

    return { totalCustomers, totalRevenue, expiringSoon, totalDebt, loyal, normal, topCustomer };
  }, [customers, debtCustomers]);

  const pieData = useMemo(
    () => [
      { name: t.statusLoyal, value: stats.loyal },
      { name: t.statusNormal, value: stats.normal },
    ],
    [stats.loyal, stats.normal, t.statusLoyal, t.statusNormal]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">{t.dashboardTitle}</h1>
        <p className="mt-0.5 text-sm text-ink-500">{t.dashboardSubtitle}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-ink-100 bg-white py-20">
          <Loader2 size={24} className="animate-spin text-amtel-600" />
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-amtel-200 bg-amtel-50 py-16 text-center">
          <AlertTriangle size={22} className="text-amtel-600" />
          <p className="font-medium text-amtel-700">{t.couldntLoadCustomers}</p>
          <p className="max-w-sm text-sm text-amtel-600">{loadError}</p>
        </div>
      ) : (
        <>
          {stats.topCustomer && (
            <div className="overflow-hidden rounded-xl bg-gradient-to-r from-amtel-700 to-amtel-600 p-5 text-white shadow-sm">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <Star size={26} className="fill-amber-300 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                      {t.topCustomerLabel}
                    </p>
                    <p className="text-lg font-bold">{stats.topCustomer.name}</p>
                    <p className="text-sm text-white/80">{stats.topCustomer.mainPhone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold tabular-nums">
                      ${(stats.topCustomer.totalTopupAmount ?? 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-white/70">{t.totalTopupVolume}</p>
                  </div>
                  <a
                    href={telHref(stats.topCustomer.mainPhone)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
                    title={t.actionCall}
                  >
                    <Phone size={16} />
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label={t.totalCustomers}
              value={String(stats.totalCustomers)}
              icon={<Users size={20} />}
              accent="#dc2626"
            />
            <StatCard
              label={t.totalTopupVolume}
              value={`$${stats.totalRevenue.toFixed(2)}`}
              icon={<TrendingUp size={20} />}
              accent="#16a34a"
            />
            <StatCard
              label={t.statsExpiringSoon}
              value={String(stats.expiringSoon)}
              icon={<Clock size={20} />}
              accent="#d97706"
            />
            <StatCard
              label={t.totalDebt}
              value={`$${stats.totalDebt.toFixed(2)}`}
              icon={<Wallet size={20} />}
              accent="#7c3aed"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-ink-900">{t.loyaltyDistribution}</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={78}
                      paddingAngle={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={entry.name} fill={PIE_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={24} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
              <h3 className="border-b border-ink-100 px-4 py-3 text-sm font-semibold text-ink-900">
                {t.recentTopupsTitle}
              </h3>
              {recentTopups.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-ink-500">{t.noTopupsYet}</p>
              ) : (
                <ol className="divide-y divide-ink-100">
                  {recentTopups.map((topup) => (
                    <li key={topup.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amtel-50 text-amtel-600">
                        <ReceiptText size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink-900">
                          {topup.customerName}
                        </p>
                        <p className="text-xs text-ink-500">
                          {topup.createdAt ? formatDateTime(topup.createdAt.toDate()) : "—"}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-amtel-700">
                        ${topup.amount.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
