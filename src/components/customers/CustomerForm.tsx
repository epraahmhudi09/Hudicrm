import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { X, Loader2, Star, UserCheck } from "lucide-react";
import type { Customer, CustomerFormData, CustomerStatus } from "../../types/customer";
import { EMPTY_CUSTOMER_FORM } from "../../types/customer";
import { PHONE_PATTERN } from "../../utils/customerValidation";
import { useLanguage } from "../../context/LanguageContext";

interface CustomerFormProps {
  customer: Customer | null;
  onSubmit: (data: CustomerFormData, createdAt?: Date) => Promise<void>;
  onClose: () => void;
}

interface FieldErrors {
  name?: string;
  mainPhone?: string;
  backupPhone?: string;
  bundle?: string;
}

function todayInputValue(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export default function CustomerForm({ customer, onSubmit, onClose }: CustomerFormProps) {
  const { t } = useLanguage();
  const isEdit = Boolean(customer);
  const [form, setForm] = useState<CustomerFormData>(EMPTY_CUSTOMER_FORM);
  const [createdDate, setCreatedDate] = useState<string>(todayInputValue());
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name,
        mainPhone: customer.mainPhone,
        backupPhone: customer.backupPhone,
        bundle: customer.bundle,
        status: customer.status,
      });
    } else {
      setForm(EMPTY_CUSTOMER_FORM);
      setCreatedDate(todayInputValue());
    }
    setErrors({});
    setSubmitError(null);
  }, [customer]);

  function validate(): boolean {
    const next: FieldErrors = {};

    if (!form.name.trim()) next.name = t.nameRequired;

    if (!form.mainPhone.trim()) {
      next.mainPhone = t.mainPhoneRequired;
    } else if (!PHONE_PATTERN.test(form.mainPhone.trim())) {
      next.mainPhone = t.phoneInvalid;
    }

    if (form.backupPhone.trim() && !PHONE_PATTERN.test(form.backupPhone.trim())) {
      next.backupPhone = t.phoneInvalid;
    }

    if (!form.bundle.trim()) next.bundle = t.bundleRequired;

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function update<K extends keyof CustomerFormData>(key: K, value: CustomerFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const customData =
        !isEdit && createdDate ? new Date(`${createdDate}T00:00:00`) : undefined;
      await onSubmit(
        {
          name: form.name.trim(),
          mainPhone: form.mainPhone.trim(),
          backupPhone: form.backupPhone.trim(),
          bundle: form.bundle.trim(),
          status: form.status,
        },
        customData
      );
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
            {isEdit ? t.editCustomer : t.addCustomer}
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
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink-700">
              {t.fieldName} <span className="text-amtel-600">*</span>
            </label>
            <input
              id="name"
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
              <label htmlFor="mainPhone" className="mb-1.5 block text-sm font-medium text-ink-700">
                {t.fieldMainPhone} <span className="text-amtel-600">*</span>
              </label>
              <input
                id="mainPhone"
                type="tel"
                value={form.mainPhone}
                onChange={(e) => update("mainPhone", e.target.value)}
                placeholder={t.fieldMainPhonePlaceholder}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${
                  errors.mainPhone
                    ? "border-amtel-400 focus:border-amtel-500 focus:ring-amtel-500/20"
                    : "border-ink-300 focus:border-amtel-500 focus:ring-amtel-500/20"
                }`}
              />
              {errors.mainPhone && (
                <p className="mt-1 text-xs text-amtel-600">{errors.mainPhone}</p>
              )}
            </div>

            <div>
              <label htmlFor="backupPhone" className="mb-1.5 block text-sm font-medium text-ink-700">
                {t.fieldBackupPhone}
              </label>
              <input
                id="backupPhone"
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
            <label htmlFor="bundle" className="mb-1.5 block text-sm font-medium text-ink-700">
              {t.fieldBundle} <span className="text-amtel-600">*</span>
            </label>
            <input
              id="bundle"
              type="text"
              value={form.bundle}
              onChange={(e) => update("bundle", e.target.value)}
              placeholder={t.fieldBundlePlaceholder}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${
                errors.bundle
                  ? "border-amtel-400 focus:border-amtel-500 focus:ring-amtel-500/20"
                  : "border-ink-300 focus:border-amtel-500 focus:ring-amtel-500/20"
              }`}
            />
            {errors.bundle && <p className="mt-1 text-xs text-amtel-600">{errors.bundle}</p>}
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-700">{t.fieldStatus}</span>
            <div className="grid grid-cols-2 gap-2">
              <StatusOption
                active={form.status === "normal"}
                icon={<UserCheck size={15} />}
                label={t.statusNormal}
                onClick={() => update("status", "normal" as CustomerStatus)}
              />
              <StatusOption
                active={form.status === "loyal"}
                icon={<Star size={15} />}
                label={t.statusLoyal}
                onClick={() => update("status", "loyal" as CustomerStatus)}
              />
            </div>
          </div>

          {!isEdit && (
            <div>
              <label htmlFor="createdDate" className="mb-1.5 block text-sm font-medium text-ink-700">
                {t.fieldCreatedDate}
              </label>
              <input
                id="createdDate"
                type="date"
                value={createdDate}
                max={todayInputValue()}
                onChange={(e) => setCreatedDate(e.target.value)}
                className="w-full rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
              />
              <p className="mt-1 text-xs text-ink-500">{t.fieldCreatedDateHelper}</p>
            </div>
          )}

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
              {isEdit ? t.saveChanges : t.addCustomer}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatusOption({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "border-amtel-500 bg-amtel-50 text-amtel-700"
          : "border-ink-300 text-ink-500 hover:bg-ink-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
