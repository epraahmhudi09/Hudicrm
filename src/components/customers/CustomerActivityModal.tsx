import { useEffect, useState, type FormEvent } from "react";
import {
  X,
  Loader2,
  PlusCircle,
  Star,
  Phone,
  StickyNote,
  UserPlus,
  Pencil,
  Wallet,
} from "lucide-react";
import type { Customer, CustomerActivity } from "../../types/customer";
import { getActivitiesRealtime, logActivity } from "../../services/customerService";
import { useLanguage } from "../../context/LanguageContext";

interface CustomerActivityModalProps {
  customer: Customer;
  onClose: () => void;
}

const ICONS: Record<CustomerActivity["type"], typeof Star> = {
  created: UserPlus,
  status_change: Star,
  call: Phone,
  note: StickyNote,
  updated: Pencil,
  topup: Wallet,
};

function formatTimestamp(activity: CustomerActivity): string {
  const date = activity.createdAt?.toDate();
  if (!date) return "";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CustomerActivityModal({ customer, onClose }: CustomerActivityModalProps) {
  const { t } = useLanguage();
  const [activities, setActivities] = useState<CustomerActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = getActivitiesRealtime(customer.id, (data) => {
      setActivities(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [customer.id]);

  async function handleAddNote(e: FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setSubmitting(true);
    try {
      await logActivity(customer.id, "note", note.trim());
      setNote("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-ink-900">{t.historyTitle}</h2>
            <p className="truncate text-xs text-ink-500">{customer.name}</p>
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
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={22} className="animate-spin text-amtel-600" />
            </div>
          ) : activities.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-500">{t.historyEmpty}</p>
          ) : (
            <ol className="space-y-4">
              {activities.map((activity) => {
                const Icon = ICONS[activity.type] ?? StickyNote;
                return (
                  <li key={activity.id} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amtel-50 text-amtel-600">
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1 border-b border-ink-100 pb-3">
                      <p className="text-sm text-ink-900">{activity.message}</p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {formatTimestamp(activity)} · {activity.createdBy}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <form
          onSubmit={handleAddNote}
          className="flex items-center gap-2 border-t border-ink-100 px-5 py-4"
        >
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.notePlaceholder}
            className="flex-1 rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
          />
          <button
            type="submit"
            disabled={submitting || !note.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-amtel-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-amtel-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <PlusCircle size={14} />
            )}
            {t.addNote}
          </button>
        </form>
      </div>
    </div>
  );
}
