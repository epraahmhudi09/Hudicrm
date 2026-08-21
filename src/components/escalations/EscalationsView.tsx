import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Phone, PhoneCall, Trash2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useTenantId } from "../../context/AuthContext";
import { clearOverdueStatus, getCustomersRealtime } from "../../services/customerService";
import type { Customer } from "../../types/customer";
import { telHref } from "../../utils/phone";
import ConfirmDialog from "../common/ConfirmDialog";

function daysOverdue(bundleExpiry: Customer["bundleExpiry"]): number | null {
  if (!bundleExpiry) return null;
  const diffMs = Date.now() - bundleExpiry.toDate().getTime();
  if (diffMs < 0) return null;
  return Math.floor(diffMs / 86400000);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function EscalationsView() {
  const { t } = useLanguage();
  const tenantId = useTenantId();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [clearTarget, setClearTarget] = useState<Customer | null>(null);
  const [clearing, setClearing] = useState(false);

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

  const escalated = useMemo(() => {
    return customers
      .filter((c) => {
        if (!c.bundleExpiry || !c.last48hEscalationSentFor) return false;
        return c.last48hEscalationSentFor.toDate().getTime() === c.bundleExpiry.toDate().getTime();
      })
      .map((c) => ({
        customer: c,
        flaggedAt: c.last48hEscalationSentFor!.toDate(),
        overdue: daysOverdue(c.bundleExpiry),
      }))
      .sort((a, b) => b.flaggedAt.getTime() - a.flaggedAt.getTime());
  }, [customers]);

  async function handleConfirmClear() {
    if (!clearTarget) return;
    setClearing(true);
    try {
      await clearOverdueStatus(clearTarget.id);
      setClearTarget(null);
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">{t.escalationsTitle}</h1>
        <p className="mt-0.5 text-sm text-ink-500">{t.escalationsSubtitle}</p>
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
      ) : escalated.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-300 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={22} />
          </div>
          <p className="font-medium text-ink-900">{t.escalationsEmptyTitle}</p>
          <p className="max-w-xs text-sm text-ink-500">{t.escalationsEmptySubtitle}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-100/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                  <th className="px-4 py-3">{t.colName}</th>
                  <th className="px-4 py-3">{t.colMainPhone}</th>
                  <th className="px-4 py-3">{t.colBackupPhone}</th>
                  <th className="px-4 py-3">{t.colEscalatedAt}</th>
                  <th className="px-4 py-3">{t.colDaysOverdue}</th>
                  <th className="px-4 py-3 text-right">{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {escalated.map(({ customer, flaggedAt, overdue }) => (
                  <tr key={customer.id} className="transition hover:bg-ink-100/40">
                    <td className="px-4 py-3 font-medium text-ink-900">{customer.name}</td>
                    <td className="px-4 py-3">
                      <a
                        href={telHref(customer.mainPhone)}
                        className="flex items-center gap-1.5 text-ink-700 transition hover:text-amtel-600 hover:underline"
                      >
                        <Phone size={13} className="text-amtel-600" />
                        {customer.mainPhone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {customer.backupPhone ? (
                        <a
                          href={telHref(customer.backupPhone)}
                          className="flex items-center gap-1.5 transition hover:text-amtel-600 hover:underline"
                        >
                          <Phone size={13} />
                          {customer.backupPhone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-500">{formatDate(flaggedAt)}</td>
                    <td className="px-4 py-3">
                      {overdue !== null && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                          {t.daysOverdue(overdue)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={telHref(customer.mainPhone)}
                          title={t.actionCall}
                          className="flex items-center gap-1.5 rounded-lg bg-amtel-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-amtel-700"
                        >
                          <PhoneCall size={13} />
                          {t.actionCall}
                        </a>
                        <button
                          onClick={() => setClearTarget(customer)}
                          title={t.delete}
                          className="flex items-center gap-1.5 rounded-lg p-1.5 text-ink-400 transition hover:bg-amtel-50 hover:text-amtel-600"
                          aria-label={t.delete}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {clearTarget && (
        <ConfirmDialog
          title={t.clearOverdueTitle}
          message={t.clearOverdueMessage(clearTarget.name)}
          confirmLabel={t.delete}
          loading={clearing}
          onConfirm={handleConfirmClear}
          onCancel={() => setClearTarget(null)}
        />
      )}
    </div>
  );
}
