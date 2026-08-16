import { useEffect, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Ban,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Plus,
  PlayCircle,
  ShieldCheck,
  Trash2,
  Users as UsersIcon,
  X,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import {
  createTenantUser,
  getUsersWithTenants,
  manageTenantUser,
  type AdminUserRow,
  type CreateTenantUserResult,
} from "../../services/adminService";
import ConfirmDialog from "../common/ConfirmDialog";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

interface AddUserFormState {
  ownerName: string;
  businessName: string;
  email: string;
  password: string;
  supportPhone: string;
  supportPhoneBackup: string;
}

const EMPTY_FORM: AddUserFormState = {
  ownerName: "",
  businessName: "",
  email: "",
  password: "",
  supportPhone: "",
  supportPhoneBackup: "",
};

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg border border-ink-200 bg-ink-100/50 px-2.5 py-1.5 text-xs text-ink-900">
          {value}
        </code>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-ink-300 bg-white px-2 py-1.5 text-xs font-medium text-ink-700 transition hover:bg-ink-100"
        >
          {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
          {copied ? t.copied : t.copyToClipboard}
        </button>
      </div>
    </div>
  );
}

function AddUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState<AddUserFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateTenantUserResult | null>(null);

  function update<K extends keyof AddUserFormState>(key: K, value: AddUserFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await createTenantUser(form);
      setResult(created);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.userCreateFailed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4"
      onClick={result ? onClose : undefined}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-ink-900">
            {result ? t.userCreatedTitle : t.addUser}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {result ? (
          <div className="space-y-4 overflow-y-auto px-5 py-5">
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
              <p className="text-sm text-emerald-800">{t.userCreatedSubtitle}</p>
            </div>
            <CopyRow label={t.webhookTokenLabel} value={result.webhookToken} />
            <div>
              <p className="mb-1 text-xs font-medium text-ink-500">{t.webhookUrlsLabel}</p>
              <div className="space-y-2">
                <CopyRow label="sms-webhook" value={result.urls.smsWebhook} />
                <CopyRow label="pending-sms" value={result.urls.pendingSms} />
                <CopyRow label="mark-sms-sent" value={result.urls.markSmsSent} />
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-amtel-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amtel-700"
            >
              {t.doneLabel}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto px-5 py-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">
                {t.fieldOwnerName}
              </label>
              <input
                required
                type="text"
                value={form.ownerName}
                onChange={(e) => update("ownerName", e.target.value)}
                className="w-full rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">
                {t.fieldBusinessName}
              </label>
              <input
                required
                type="text"
                value={form.businessName}
                onChange={(e) => update("businessName", e.target.value)}
                className="w-full rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">{t.fieldEmail}</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">
                {t.fieldPassword}
              </label>
              <input
                required
                minLength={6}
                type="text"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="w-full rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  {t.fieldSupportPhone}
                </label>
                <input
                  required
                  type="tel"
                  value={form.supportPhone}
                  onChange={(e) => update("supportPhone", e.target.value)}
                  className="w-full rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  {t.fieldSupportPhoneBackup}
                </label>
                <input
                  type="tel"
                  value={form.supportPhoneBackup}
                  onChange={(e) => update("supportPhoneBackup", e.target.value)}
                  className="w-full rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-amtel-200 bg-amtel-50 px-3 py-2.5 text-sm text-amtel-700">
                {error}
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
                {t.addUser}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function UsersView() {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    getUsersWithTenants()
      .then((data) => {
        setRows(data);
        setLoadError(null);
      })
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleToggle(row: AdminUserRow) {
    setActionError(null);
    setBusyUid(row.uid);
    try {
      await manageTenantUser(row.uid, row.disabled ? "enable" : "disable");
      load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t.userCreateFailed);
    } finally {
      setBusyUid(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionError(null);
    try {
      await manageTenantUser(deleteTarget.uid, "delete");
      setDeleteTarget(null);
      load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t.userCreateFailed);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900">{t.usersTitle}</h1>
          <p className="mt-0.5 text-sm text-ink-500">{t.usersSubtitle}</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-amtel-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amtel-700"
        >
          <Plus size={16} />
          {t.addUser}
        </button>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-lg border border-amtel-200 bg-amtel-50 px-3 py-2.5 text-sm text-amtel-700">
          <AlertTriangle size={14} className="shrink-0" />
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-ink-100 bg-white py-20">
          <Loader2 size={24} className="animate-spin text-amtel-600" />
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-amtel-200 bg-amtel-50 py-16 text-center">
          <AlertTriangle size={22} className="text-amtel-600" />
          <p className="font-medium text-amtel-700">{t.couldntLoadUsers}</p>
          <p className="max-w-sm text-sm text-amtel-600">{loadError}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-300 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amtel-50 text-amtel-600">
            <ShieldCheck size={22} />
          </div>
          <p className="font-medium text-ink-900">{t.usersEmptyTitle}</p>
          <p className="max-w-xs text-sm text-ink-500">{t.usersEmptySubtitle}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-100/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                  <th className="px-4 py-3">{t.colBusinessName}</th>
                  <th className="px-4 py-3">{t.colOwnerName}</th>
                  <th className="px-4 py-3">{t.colEmail}</th>
                  <th className="px-4 py-3">{t.colStatus}</th>
                  <th className="px-4 py-3">{t.colCustomers}</th>
                  <th className="px-4 py-3">{t.colJoined}</th>
                  <th className="px-4 py-3 text-right">{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {rows.map((row) => {
                  const isSelf = row.uid === currentUser?.uid;
                  return (
                    <tr key={row.uid} className="transition hover:bg-ink-100/40">
                      <td className="px-4 py-3 font-medium text-ink-900">
                        {row.tenant.businessName}
                      </td>
                      <td className="px-4 py-3 text-ink-700">{row.tenant.ownerName}</td>
                      <td className="px-4 py-3 text-ink-500">{row.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            row.disabled
                              ? "bg-ink-100 text-ink-500"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {row.disabled ? t.statusDisabled : t.statusActive}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-ink-700">
                          <UsersIcon size={13} className="text-ink-400" />
                          {row.customerCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-500">
                        {row.tenant.createdAt ? formatDate(row.tenant.createdAt.toDate()) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {!isSelf && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => void handleToggle(row)}
                              disabled={busyUid === row.uid}
                              title={row.disabled ? t.actionEnable : t.actionDisable}
                              className="rounded-lg p-1.5 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 disabled:opacity-50"
                            >
                              {busyUid === row.uid ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : row.disabled ? (
                                <PlayCircle size={15} />
                              ) : (
                                <Ban size={15} />
                              )}
                            </button>
                            <button
                              onClick={() => setDeleteTarget(row)}
                              title={t.actionDeleteUser}
                              className="rounded-lg p-1.5 text-ink-500 transition hover:bg-amtel-50 hover:text-amtel-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {addOpen && (
        <AddUserModal
          onClose={() => {
            setAddOpen(false);
            load();
          }}
          onCreated={load}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={t.deleteUserTitle}
          message={t.deleteUserMessage(deleteTarget.tenant.businessName)}
          confirmLabel={t.actionDeleteUser}
          loading={deleting}
          onConfirm={() => void handleConfirmDelete()}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
