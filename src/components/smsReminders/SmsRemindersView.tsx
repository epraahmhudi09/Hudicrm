import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Loader2,
  MessageSquareText,
  Phone,
  Trash2,
  X,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useTenantId } from "../../context/AuthContext";
import { clearOverdueStatus, getCustomersRealtime } from "../../services/customerService";
import { getOutboundSmsForCustomer } from "../../services/outboundSmsService";
import type { Customer } from "../../types/customer";
import type { OutboundSms } from "../../types/outboundSms";
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

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function MessagePreviewModal({
  tenantId,
  customer,
  onClose,
}: {
  tenantId: string;
  customer: Customer;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<OutboundSms[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOutboundSmsForCustomer(tenantId, customer.id)
      .then((data) => {
        if (!cancelled) setMessages(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [tenantId, customer.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-ink-900">{customer.name}</h2>
            <p className="text-xs text-ink-500">{customer.mainPhone}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error ? (
            <p className="text-sm text-amtel-600">{error}</p>
          ) : messages === null ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-amtel-600" />
            </div>
          ) : messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-500">{t.smsMessageNotFound}</p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="rounded-lg border border-ink-100 bg-ink-100/40 p-3">
                  <p className="whitespace-pre-wrap text-sm text-ink-900">{msg.message}</p>
                  <p className="mt-2 flex items-center justify-between text-xs text-ink-500">
                    <span>{msg.sentAt ? t.smsStatusSent : t.smsStatusPending}</span>
                    <span>{msg.createdAt ? formatDateTime(msg.createdAt.toDate()) : "—"}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SmsRemindersView() {
  const { t } = useLanguage();
  const tenantId = useTenantId();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
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

  const reminded = useMemo(() => {
    return customers
      .filter((c) => {
        if (!c.bundleExpiry || !c.lastExpiryAlertSentFor) return false;
        return c.lastExpiryAlertSentFor.toDate().getTime() === c.bundleExpiry.toDate().getTime();
      })
      .map((c) => ({
        customer: c,
        sentAt: c.lastExpiryAlertSentFor!.toDate(),
        overdue: daysOverdue(c.bundleExpiry),
      }))
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
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
        <h1 className="text-xl font-bold text-ink-900">{t.smsRemindersTitle}</h1>
        <p className="mt-0.5 text-sm text-ink-500">{t.smsRemindersSubtitle}</p>
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
      ) : reminded.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-300 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={22} />
          </div>
          <p className="font-medium text-ink-900">{t.smsRemindersEmptyTitle}</p>
          <p className="max-w-xs text-sm text-ink-500">{t.smsRemindersEmptySubtitle}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-100/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                  <th className="px-4 py-3">{t.colName}</th>
                  <th className="px-4 py-3">{t.colMainPhone}</th>
                  <th className="px-4 py-3">{t.colBundle}</th>
                  <th className="px-4 py-3">{t.colSentAt}</th>
                  <th className="px-4 py-3">{t.colDaysOverdue}</th>
                  <th className="px-4 py-3 text-right">{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {reminded.map(({ customer, sentAt, overdue }) => (
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
                    <td className="px-4 py-3 text-ink-700">{customer.bundle}</td>
                    <td className="px-4 py-3 text-ink-500">
                      <span className="flex items-center gap-1.5">
                        <MessageSquareText size={13} className="text-ink-400" />
                        {formatDate(sentAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {overdue !== null && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                          {t.daysOverdue(overdue)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingCustomer(customer)}
                          title={t.viewMessage}
                          className="flex items-center gap-1.5 rounded-lg border border-ink-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-sm transition hover:bg-ink-100"
                        >
                          <Eye size={13} />
                          {t.viewMessage}
                        </button>
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

      {viewingCustomer && (
        <MessagePreviewModal
          tenantId={tenantId}
          customer={viewingCustomer}
          onClose={() => setViewingCustomer(null)}
        />
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
