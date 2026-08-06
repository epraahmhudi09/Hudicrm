import { Star, UserCheck } from "lucide-react";
import type { CustomerStatus } from "../../types/customer";
import { useLanguage } from "../../context/LanguageContext";

export default function StatusBadge({ status }: { status: CustomerStatus }) {
  const { t } = useLanguage();

  if (status === "loyal") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        <Star size={12} className="fill-amber-500 text-amber-500" />
        {t.statusLoyal}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      <UserCheck size={12} />
      {t.statusNormal}
    </span>
  );
}
