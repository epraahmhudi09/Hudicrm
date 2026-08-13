import { useEffect, useState, type FormEvent } from "react";
import { X, Loader2 } from "lucide-react";
import type { DebtCustomer, DebtCustomerFormData } from "../../types/debtCustomer";
import { EMPTY_DEBT_CUSTOMER_FORM } from "../../types/debtCustomer";
import { PHONE_PATTERN } from "../../utils/customerValidation";
import { useLanguage } from "../../context/LanguageContext";

interface DebtCustomerFormProps {
  debtCustomer: DebtCustomer | null;
  onSubmit: (data: DebtCustomerFormData) => Promise<void>;
  onClose: () => void;
}

interface FieldErrors {
  name?: string;
  phone?: string;
  backupPhone?: string;
  amount?: string;
}

export default function DebtCustomerForm({ debtCustomer, onSubmit, onClose }: DebtCustomerFormProps) {
  const { t } = useLanguage();
  const isEdit = Boolean(debtCustomer);
  const [form, setForm] = useState<DebtCustomerFormData>(EMPTY_DEBT_CUSTOMER_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (debtCustomer) {
      setForm({
        name: debtCustomer.name,
        phone: debtCustomer.phone,
        backupPhone: debtCustomer.backupPhone,
        amount: String(debtCustomer.amount),
      });
    } else {
      setForm(EMPTY_DEBT_CUSTOMER_FORM);
    }
    setErrors({});
    setSubmitError(null);
  }, [debtCustomer]);

  function validate(): boolean {
    const next: FieldErrors = {};

    if (!form.name.trim()) next.name = t.nameRequired;

    if (!form.phone.trim()) {
      next.phone = t.phoneRequired;
    } else if (!PHONE_PATTERN.test(form.phone.trim())) {
      next.phone = t.phoneInvalid;
    }

    if (form.backupPhone.trim() && !PHONE_PATTERN.test(form.backupPhone.trim())) {
      next.backupPhone = t.phoneInvalid;
    }

    const amountNum = Number(form.amount);
    if (!form.amount.trim()) {
      next.amount = t.amountRequired;
    } else if (!Number.isFinite(amountNum) || amountNum < 0) {
      next.amount = t.amountInvalid;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function update<K extends keyof DebtCustomerFormData>(key: K, value: DebtCustomerFormData[K]) {
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
        phone: form.phone.trim(),
        backupPhone: form.backupPhone.trim(),
        amount: form.amount.trim(),
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
            {isEdit ? t.editDebtCustomer : t.addDebtCustomer}
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
            <label htmlFor="debtName" className="mb-1.5 block text-sm font-medium text-ink-700">
              {t.fieldName} <span className="text-amtel-600">*</span>
            </label>
            <input
              id="debtName"
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder={t.fieldNamePlaceholder}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${
                errors.name
                  ? "border-amtel-400 focus:border-amtel-500 focus:ring-amtel-500/20"
                  : "border-ink-300 focus:border-amtel-500 focus:ring-amtel-500/20"
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-amtel-600">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="debtPhone" className="mb-1.5 block text-sm font-medium text-ink-700">
                {t.fieldPhone} <span className="text-amtel-600">*</span>
              </label>
              <input
                id="debtPhone"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder={t.fieldPhonePlaceholder}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${
                  errors.phone
                    ? "border-amtel-400 focus:border-amtel-500 focus:ring-amtel-500/20"
                    : "border-ink-300 focus:border-amtel-500 focus:ring-amtel-500/20"
                }`}
              />
              {errors.phone && <p className="mt-1 text-xs text-amtel-600">{errors.phone}</p>}
            </div>

            <div>
              <label
                htmlFor="debtBackupPhone"
                className="mb-1.5 block text-sm font-medium text-ink-700"
              >
                {t.fieldBackupPhone}
              </label>
              <input
                id="debtBackupPhone"
                type="tel"
                value={form.backupPhone}
                onChange={(e) => update("backupPhone", e.target.value)}
                placeholder={t.fieldBackupPhonePlaceholder}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${
                  errors.backupPhone
                    ? "border-amtel-400 focus:border-amtel-500 focus:ring-amtel-500/20"
                    : "border-ink-300 focus:border-amtel-500 focus:ring-amtel-500/20"
                }`}
              />
              {errors.backupPhone && (
                <p className="mt-1 text-xs text-amtel-600">{errors.backupPhone}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="debtAmount" className="mb-1.5 block text-sm font-medium text-ink-700">
              {t.fieldAmount} <span className="text-amtel-600">*</span>
            </label>
            <input
              id="debtAmount"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
              placeholder={t.fieldAmountPlaceholder}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${
                errors.amount
                  ? "border-amtel-400 focus:border-amtel-500 focus:ring-amtel-500/20"
                  : "border-ink-300 focus:border-amtel-500 focus:ring-amtel-500/20"
              }`}
            />
            {errors.amount && <p className="mt-1 text-xs text-amtel-600">{errors.amount}</p>}
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
              {isEdit ? t.saveChanges : t.addDebtCustomer}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
