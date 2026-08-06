import type { Timestamp } from "firebase/firestore";
import { AlertCircle, Clock } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const WARNING_WINDOW_DAYS = 7;

export function daysUntilExpiry(bundleExpiry: Timestamp | null | undefined): number | null {
  if (!bundleExpiry) return null;
  const diffMs = bundleExpiry.toDate().getTime() - Date.now();
  return Math.ceil(diffMs / 86400000);
}

export default function ExpiryBadge({
  bundleExpiry,
}: {
  bundleExpiry: Timestamp | null | undefined;
}) {
  const { t } = useLanguage();
  const days = daysUntilExpiry(bundleExpiry);
  if (days === null || days > WARNING_WINDOW_DAYS) return null;

  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
        <AlertCircle size={11} />
        {t.expiryBadgeExpired}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
      <Clock size={11} />
      {t.expiryBadgeDays(days)}
    </span>
  );
}
