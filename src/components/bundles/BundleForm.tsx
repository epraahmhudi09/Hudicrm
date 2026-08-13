import { useEffect, useState, type FormEvent } from "react";
import { X, Loader2 } from "lucide-react";
import type { Bundle, BundleFormData, DurationUnit } from "../../types/bundle";
import { EMPTY_BUNDLE_FORM } from "../../types/bundle";
import { useLanguage } from "../../context/LanguageContext";

interface BundleFormProps {
  bundle: Bundle | null;
  onSubmit: (data: BundleFormData) => Promise<void>;
  onClose: () => void;
}

interface FieldErrors {
  amount?: string;
  durationValue?: string;
}

export default function BundleForm({ bundle, onSubmit, onClose }: BundleFormProps) {
  const { t } = useLanguage();
  const isEdit = Boolean(bundle);
  const [form, setForm] = useState<BundleFormData>(EMPTY_BUNDLE_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (bundle) {
      setForm({
        name: bundle.name,
        amount: String(bundle.amount),
        durationValue: String(bundle.durationValue),
        durationUnit: bundle.durationUnit,
      });
    } else {
      setForm(EMPTY_BUNDLE_FORM);
    }
    setErrors({});
    setSubmitError(null);
  }, [bundle]);

  function validate(): boolean {
    const next: FieldErrors = {};

    const amountNum = Number(form.amount);
    if (!form.amount.trim()) {
      next.amount = t.priceRequired;
    } else if (!Number.isFinite(amountNum) || amountNum <= 0) {
      next.amount = t.priceInvalid;
    }

    const durationNum = Number(form.durationValue);
    if (!form.durationValue.trim()) {
      next.durationValue = t.durationRequired;
    } else if (!Number.isFinite(durationNum) || durationNum <= 0) {
      next.durationValue = t.durationInvalid;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function update<K extends keyof BundleFormData>(key: K, value: BundleFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        name: form.name.trim(),
        amount: form.amount.trim(),
        durationValue: form.durationValue.trim(),
        durationUnit: form.durationUnit,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-ink-900">
            {isEdit ? t.editBundle : t.addBundle}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div>
            <label htmlFor="bundleName" className="mb-1.5 block text-sm font-medium text-ink-700">
              {t.fieldBundleName}
            </label>
            <input
              id="bundleName"
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder={t.fieldBundleNamePlaceholder}
              className="w-full rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
            />
          </div>

          <div>
            <label htmlFor="bundlePrice" className="mb-1.5 block text-sm font-medium text-ink-700">
              {t.fieldPrice} <span className="text-amtel-600">*</span>
            </label>
            <input
              id="bundlePrice"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
              placeholder={t.fieldPricePlaceholder}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${
                errors.amount
                  ? "border-amtel-400 focus:border-amtel-500 focus:ring-amtel-500/20"
                  : "border-ink-300 focus:border-amtel-500 focus:ring-amtel-500/20"
              }`}
            />
            {errors.amount && <p className="mt-1 text-xs text-amtel-600">{errors.amount}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="bundleDuration"
                className="mb-1.5 block text-sm font-medium text-ink-700"
              >
                {t.fieldDurationValue} <span className="text-amtel-600">*</span>
              </label>
              <input
                id="bundleDuration"
                type="number"
                min="0"
                step="1"
                value={form.durationValue}
                onChange={(e) => update("durationValue", e.target.value)}
                placeholder={t.fieldDurationValuePlaceholder}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${
                  errors.durationValue
                    ? "border-amtel-400 focus:border-amtel-500 focus:ring-amtel-500/20"
                    : "border-ink-300 focus:border-amtel-500 focus:ring-amtel-500/20"
                }`}
              />
              {errors.durationValue && (
                <p className="mt-1 text-xs text-amtel-600">{errors.durationValue}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="bundleDurationUnit"
                className="mb-1.5 block text-sm font-medium text-ink-700"
              >
                {t.fieldDurationUnit}
              </label>
              <select
                id="bundleDurationUnit"
                value={form.durationUnit}
                onChange={(e) => update("durationUnit", e.target.value as DurationUnit)}
                className="w-full rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
              >
                <option value="hours">{t.durationUnitHours}</option>
                <option value="days">{t.durationUnitDays}</option>
                <option value="months">{t.durationUnitMonths}</option>
              </select>
            </div>
          </div>

          {submitError && (
            <div className="rounded-lg bg-amtel-50 border border-amtel-200 px-3 py-2.5 text-sm text-amtel-700">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-ink-100 disabled:opacity-60"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-amtel-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amtel-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? t.saveChanges : t.addBundle}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
