import { useMemo, type ReactNode } from "react";
import { Users, Star, UserCheck, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { Customer } from "../../types/customer";

interface StatsOverviewProps {
  customers: Customer[];
}

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  accent: string;
}

function StatCard({ label, value, icon, accent }: StatCardProps) {
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

const PIE_COLORS = ["#dc2626", "#64748b"];

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short" });
}

export default function StatsOverview({ customers }: StatsOverviewProps) {
  const stats = useMemo(() => {
    const total = customers.length;
    const loyal = customers.filter((c) => c.status === "loyal").length;
    const normal = total - loyal;

    const now = new Date();
    const newThisMonth = customers.filter((c) => {
      const createdDate = c.createdAt?.toDate();
      return (
        createdDate &&
        createdDate.getMonth() === now.getMonth() &&
        createdDate.getFullYear() === now.getFullYear()
      );
    }).length;

    return { total, loyal, normal, newThisMonth };
  }, [customers]);

  const pieData = useMemo(
    () => [
      { name: "Loyal", value: stats.loyal },
      { name: "Normal", value: stats.normal },
    ],
    [stats.loyal, stats.normal]
  );

  const trendData = useMemo(() => {
    const now = new Date();
    const buckets = new Map<string, { label: string; count: number }>();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.set(monthKey(d), { label: monthLabel(d), count: 0 });
    }

    for (const customer of customers) {
      const createdDate = customer.createdAt?.toDate();
      if (!createdDate) continue;
      const key = monthKey(createdDate);
      const bucket = buckets.get(key);
      if (bucket) bucket.count += 1;
    }

    return Array.from(buckets.values());
  }, [customers]);

  const hasData = stats.total > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Customers"
          value={stats.total}
          icon={<Users size={20} />}
          accent="#dc2626"
        />
        <StatCard
          label="Loyal Customers"
          value={stats.loyal}
          icon={<Star size={20} />}
          accent="#d97706"
        />
        <StatCard
          label="Normal Customers"
          value={stats.normal}
          icon={<UserCheck size={20} />}
          accent="#64748b"
        />
        <StatCard
          label="New This Month"
          value={stats.newThisMonth}
          icon={<TrendingUp size={20} />}
          accent="#16a34a"
        />
      </div>

      {hasData && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-sm lg:col-span-2">
            <h3 className="mb-2 text-sm font-semibold text-ink-900">
              Loyalty Distribution
            </h3>
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

          <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-sm lg:col-span-3">
            <h3 className="mb-2 text-sm font-semibold text-ink-900">
              New Customers (Last 6 Months)
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip cursor={{ fill: "#fef2f2" }} />
                  <Bar dataKey="count" name="New Customers" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
