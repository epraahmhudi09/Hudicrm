import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, MessageSquareText, Phone } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { getCustomersRealtime } from "../../services/customerService";
import type { Customer } from "../../types/customer";
import { telHref } from "../../utils/phone";

function daysOverdue(bundleExpiry: Customer["bundleExpiry"]): number | null {
  if (!bundleExpiry) return null;
  const diffMs = Date.now() - bundleExpiry.toDate().getTime();
  if (diffMs < 0) return null;
  return Math.floor(diffMs / 86400000);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function SmsRemindersView() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = getCustomersRealtime(
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
  }, []);

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
