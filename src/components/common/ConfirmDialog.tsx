import { AlertTriangle, Loader2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useLanguage();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amtel-50 text-amtel-600">
            <AlertTriangle size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-ink-900">{title}</h3>
            <p className="mt-1 text-sm text-ink-500">{message}</p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-100 disabled:opacity-60"
          >
            {t.cancel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-amtel-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-amtel-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel ?? t.delete}
          </button>
        </div>
      </div>
    </div>
  );
}
