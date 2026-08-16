import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowDownWideNarrow, ArrowUpWideNarrow, Loader2, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLanguage } from "../../context/LanguageContext";
import { useTenantId } from "../../context/AuthContext";
import { getCustomersRealtime } from "../../services/customerService";
import { getTopupsInRange } from "../../services/topupService";
import type { Customer } from "../../types/customer";
import type { Topup } from "../../types/topup";

type Period = "today" | "week" | "month" | "all";

interface RankedEntry {
  id: string;
  name: string;
  phone: string;
  amount: number;
}

function periodStart(period: Period): Date {
  const now = new Date();
  if (period === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "week") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

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

function RankedList({ rows, emptyText }: { rows: RankedEntry[]; emptyText: string }) {
  if (rows.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-ink-500">{emptyText}</p>;
  }
  return (
    <ol className="divide-y divide-ink-100">
      {rows.map((row, index) => (
        <li key={row.id} className="flex items-center gap-3 px-4 py-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-100 text-xs font-semibold text-ink-500">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-900">{row.name}</p>
            <p className="truncate text-xs text-ink-500">{row.phone}</p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-amtel-700">
            ${row.amount.toFixed(2)}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function AnalyticsView() {
  const { t } = useLanguage();
  const tenantId = useTenantId();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [period, setPeriod] = useState<Period>("all");
  const [rangedTopups, setRangedTopups] = useState<Topup[] | null>(null);
  const [loadingRange, setLoadingRange] = useState(false);
  const [rangeError, setRangeError] = useState<string | null>(null);

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
    if (period === "all") {
      setRangedTopups(null);
      setRangeError(null);
      return;
    }
    let cancelled = false;
    setLoadingRange(true);
    setRangeError(null);
    getTopupsInRange(tenantId, periodStart(period), new Date())
      .then((data) => {
        if (!cancelled) setRangedTopups(data);
      })
      .catch((error: Error) => {
        if (!cancelled) setRangeError(error.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingRange(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period, tenantId]);

  const ranked = useMemo(() => {
    let entries: RankedEntry[];

    if (rangedTopups) {
      const byCustomer = new Map<string, { name: string; amount: number }>();
      for (const topup of rangedTopups) {
        const existing = byCustomer.get(topup.customerId);
        if (existing) {
          existing.amount += topup.amount;
        } else {
          byCustomer.set(topup.customerId, { name: topup.customerName, amount: topup.amount });
        }
      }
      entries = Array.from(byCustomer.entries()).map(([id, v]) => ({
        id,
        name: v.name,
        phone: customers.find((c) => c.id === id)?.mainPhone ?? "",
        amount: v.amount,
      }));
    } else {
      entries = customers
        .map((c) => ({ id: c.id, name: c.name, phone: c.mainPhone, amount: c.totalTopupAmount ?? 0 }))
        .filter((row) => row.amount > 0);
    }

    const topSpenders = [...entries].sort((a, b) => b.amount - a.amount).slice(0, 10);
    const lowSpenders = [...entries].sort((a, b) => a.amount - b.amount).slice(0, 10);
    const totalVolume = entries.reduce((sum, row) => sum + row.amount, 0);
    const avgPerCustomer = entries.length > 0 ? totalVolume / entries.length : 0;

    return { topSpenders, lowSpenders, totalVolume, avgPerCustomer, customersWithTopups: entries.length };
  }, [customers, rangedTopups]);

  const chartData = useMemo(
    () =>
      ranked.topSpenders.map((row) => ({
        name: row.name.length > 12 ? `${row.name.slice(0, 12)}…` : row.name,
        amount: row.amount,
      })),
    [ranked.topSpenders]
  );

  const periods: Array<{ key: Period; label: string }> = [
    { key: "today", label: t.periodToday },
    { key: "week", label: t.periodWeek },
    { key: "month", label: t.periodMonth },
    { key: "all", label: t.periodAll },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900">{t.analyticsTitle}</h1>
          <p className="mt-0.5 text-sm text-ink-500">{t.analyticsSubtitle}</p>
        </div>
        <div className="flex rounded-lg border border-ink-300 bg-white p-1 text-sm">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                period === p.key ? "bg-amtel-600 text-white" : "text-ink-600 hover:bg-ink-100"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
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
      ) : rangeError ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-amtel-200 bg-amtel-50 py-16 text-center">
          <AlertTriangle size={22} className="text-amtel-600" />
          <p className="font-medium text-amtel-700">{t.couldntLoadTopups}</p>
          <p className="max-w-sm text-sm text-amtel-600">{rangeError}</p>
        </div>
      ) : loadingRange ? (
        <div className="flex items-center justify-center rounded-xl border border-ink-100 bg-white py-20">
          <Loader2 size={24} className="animate-spin text-amtel-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label={t.totalTopupVolume}
              value={`$${ranked.totalVolume.toFixed(2)}`}
              icon={<Wallet size={20} />}
              accent="#dc2626"
            />
            <StatCard
              label={t.customersWithTopups}
              value={String(ranked.customersWithTopups)}
              icon={<ArrowUpWideNarrow size={20} />}
              accent="#16a34a"
            />
            <StatCard
              label={t.avgTopupPerCustomer}
              value={`$${ranked.avgPerCustomer.toFixed(2)}`}
              icon={<ArrowDownWideNarrow size={20} />}
              accent="#d97706"
            />
          </div>

          {chartData.length > 0 && (
            <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-ink-900">{t.topSpendersTitle}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#fef2f2" }}
                      formatter={(value) => `$${Number(value).toFixed(2)}`}
                    />
                    <Bar dataKey="amount" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
              <h3 className="border-b border-ink-100 px-4 py-3 text-sm font-semibold text-ink-900">
                {t.topSpendersTitle}
              </h3>
              <RankedList rows={ranked.topSpenders} emptyText={t.noTopupsYet} />
            </div>

            <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
              <h3 className="border-b border-ink-100 px-4 py-3 text-sm font-semibold text-ink-900">
                {t.lowSpendersTitle}
              </h3>
              <RankedList rows={ranked.lowSpenders} emptyText={t.noTopupsYet} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
