import { useEffect, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useTenantId } from "../../context/AuthContext";
import { getFraudAlertsRealtime, markFraudAlertReviewed } from "../../services/fraudAlertService";
import type { FraudAlert, FraudAlertReason } from "../../types/fraudAlert";
import type { Translations } from "../../i18n/translations";

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function reasonLabel(reason: FraudAlertReason, t: Translations): string {
  if (reason === "duplicate_transaction") return t.fraudReasonDuplicateTransaction;
  if (reason === "balance_increased_after_sale") return t.fraudReasonBalanceIncreasedAfterSale;
  return t.fraudReasonBackdatedTimestamp;
}

export default function FraudAlertsView() {
  const { t } = useLanguage();
  const tenantId = useTenantId();
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = getFraudAlertsRealtime(
      tenantId,
      (data) => {
        setAlerts(data);
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

  const unreviewed = alerts.filter((a) => !a.reviewed);

  async function handleReview(id: string) {
    setReviewingId(id);
    try {
      await markFraudAlertReviewed(id);
    } finally {
      setReviewingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">{t.fraudAlertsTitle}</h1>
        <p className="mt-0.5 text-sm text-ink-500">{t.fraudAlertsSubtitle}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-ink-100 bg-white py-20">
          <Loader2 size={24} className="animate-spin text-amtel-600" />
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-amtel-200 bg-amtel-50 py-16 text-center">
          <AlertTriangle size={22} className="text-amtel-600" />
          <p className="font-medium text-amtel-700">{loadError}</p>
        </div>
      ) : unreviewed.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-300 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={22} />
          </div>
          <p className="font-medium text-ink-900">{t.fraudAlertsEmptyTitle}</p>
          <p className="max-w-xs text-sm text-ink-500">{t.fraudAlertsEmptySubtitle}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-100/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                  <th className="px-4 py-3">{t.colPhone}</th>
                  <th className="px-4 py-3">{t.colAmount}</th>
                  <th className="px-4 py-3">{t.colReason}</th>
                  <th className="px-4 py-3">{t.colDetectedAt}</th>
                  <th className="px-4 py-3 text-right">{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {unreviewed.map((alert) => (
                  <tr key={alert.id} className="transition hover:bg-ink-100/40">
                    <td className="px-4 py-3 font-medium text-ink-900">{alert.phone}</td>
                    <td className="px-4 py-3 text-ink-700">${alert.amount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {alert.reasons.map((reason) => (
                          <span
                            key={reason}
                            className="inline-flex items-center gap-1 rounded-full border border-amtel-200 bg-amtel-50 px-2 py-0.5 text-[11px] font-semibold text-amtel-700"
                          >
                            <ShieldAlert size={11} />
                            {reasonLabel(reason, t)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {alert.detectedAt ? formatDateTime(alert.detectedAt.toDate()) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => void handleReview(alert.id)}
                          disabled={reviewingId === alert.id}
                          className="flex items-center gap-1.5 rounded-lg bg-amtel-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-amtel-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {reviewingId === alert.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Check size={13} />
                          )}
                          {t.actionMarkReviewed}
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
    </div>
  );
}
