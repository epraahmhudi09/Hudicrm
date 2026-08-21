import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  MessageCircle,
  Pencil,
  Phone,
  Send,
  Trash2,
  UploadCloud,
  UserCheck,
  X,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useTenantId } from "../../context/AuthContext";
import {
  bulkAddBroadcastContacts,
  deleteBroadcastContact,
  getBroadcastContactsRealtime,
  markBroadcastContactSent,
  updateBroadcastContact,
} from "../../services/broadcastContactService";
import { getBundlesRealtime } from "../../services/bundleService";
import { getCustomersOnce } from "../../services/customerService";
import { downloadBroadcastTemplate, parseBroadcastContactsFile } from "../../utils/broadcastImport";
import { buildWhatsAppLink, fillTemplate, isProspectPhone } from "../../utils/whatsapp";
import { normalizePhone, telHref } from "../../utils/phone";
import type { BroadcastContact } from "../../types/broadcastContact";
import type { Bundle } from "../../types/bundle";
import ConfirmDialog from "../common/ConfirmDialog";

const DEFAULT_MESSAGE = `Macmiil {{name}},

Kusoo dhawoow *Shirkada Isgaarsiinta Amtel*.

Macmiil, Shirkadu waxay samaysay *Qiimo Dhimis* dhanka xirmooyinka *Bulaal Unlimited*:

1: $0.5 = 60 Saacadood Aan Xadidnayn
2: $2 = Asbuuc Aan Xadidnayn

...iyo Xirmooyin kale.

Si aad ugu shubato ama aad xog dheeraad ah u hesho, wac ama WhatsApp la xiriir:
717701253 / 907701253

Macmiil, kusoo dhawoow adeeg ku qanciya.`;

const DEFAULT_MESSAGE_PROSPECT = `Kusoo dhawoow *Shirkada Isgaarsiinta Amtel*.

Waxaan samaysanay *Qiimo Dhimis* dhanka xirmooyinka *Bulaal Unlimited*:

1: $0.5 = 60 Saacadood Aan Xadidnayn
2: $2 = Asbuuc Aan Xadidnayn

...iyo Xirmooyin kale.

Si aad ugu shubato ama aad xog dheeraad ah u hesho, wac ama WhatsApp la xiriir:
717701253 / 907701253

Kusoo dhawoow adeeg ku qanciya.`;

function EditContactModal({
  contact,
  onClose,
}: {
  contact: BroadcastContact;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState(contact.name);
  const [mainPhone, setMainPhone] = useState(contact.mainPhone);
  const [backupPhone, setBackupPhone] = useState(contact.backupPhone);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateBroadcastContact(contact.id, { name, mainPhone, backupPhone });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-ink-900">{t.broadcastEditTitle}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 px-5 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">{t.fieldName}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">
              {t.fieldMainPhone}
            </label>
            <input
              type="text"
              value={mainPhone}
              onChange={(e) => setMainPhone(e.target.value)}
              required
              className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">
              {t.fieldBackupPhone}
            </label>
            <input
              type="text"
              value={backupPhone}
              onChange={(e) => setBackupPhone(e.target.value)}
              className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-100 disabled:opacity-60"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-amtel-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-amtel-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WhatsAppBroadcastView() {
  const { t } = useLanguage();
  const tenantId = useTenantId();
  const [contacts, setContacts] = useState<BroadcastContact[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [prospectMessage, setProspectMessage] = useState(DEFAULT_MESSAGE_PROSPECT);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BroadcastContact | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<BroadcastContact | null>(null);

  useEffect(() => {
    const unsubscribe = getBroadcastContactsRealtime(
      tenantId,
      (data) => {
        setContacts(data);
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

  useEffect(() => {
    const unsubscribe = getBundlesRealtime(tenantId, setBundles);
    return unsubscribe;
  }, [tenantId]);

  const sentCount = useMemo(() => contacts.filter((c) => c.sentAt).length, [contacts]);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImportError(null);
    setImportSummary(null);
    setImporting(true);
    try {
      const rows = await parseBroadcastContactsFile(file, bundles);
      if (rows.length === 0) {
        setImportError(t.broadcastImportNoRows);
        return;
      }

      // Skip rows whose phone already belongs to a real customer or is
      // already on this broadcast list — a raw source like a telecom
      // recharge report has no idea who's already registered, so without
      // this every re-upload would pile up duplicates.
      const customers = await getCustomersOnce(tenantId);
      const knownPhones = new Set<string>();
      for (const c of customers) {
        knownPhones.add(normalizePhone(c.mainPhone));
        if (c.backupPhone) knownPhones.add(normalizePhone(c.backupPhone));
      }
      for (const c of contacts) {
        knownPhones.add(normalizePhone(c.mainPhone));
      }
      const newRows = rows.filter((r) => !knownPhones.has(normalizePhone(r.mainPhone)));

      if (newRows.length > 0) {
        await bulkAddBroadcastContacts(tenantId, newRows);
      }
      setImportSummary(t.broadcastImportSummary(newRows.length, rows.length - newRows.length));
    } catch (err) {
      setImportError(err instanceof Error ? err.message : t.broadcastImportFailed);
    } finally {
      setImporting(false);
    }
  }

  function handleSend(contact: BroadcastContact) {
    const template = isProspectPhone(contact.mainPhone) ? prospectMessage : message;
    const link = buildWhatsAppLink(contact.mainPhone, fillTemplate(template, contact.name));
    window.open(link, "_blank", "noopener,noreferrer");
    void markBroadcastContactSent(contact.id);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBroadcastContact(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">{t.broadcastTitle}</h1>
        <p className="mt-0.5 text-sm text-ink-500">{t.broadcastSubtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-ink-900">
            {t.broadcastMessageLabel}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={11}
            className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 font-mono text-xs outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
          />
          <p className="mt-1.5 text-xs text-ink-500">{t.broadcastMessageHint}</p>
        </div>

        <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-ink-900">
            {t.broadcastProspectMessageLabel}
          </label>
          <textarea
            value={prospectMessage}
            onChange={(e) => setProspectMessage(e.target.value)}
            rows={11}
            className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 font-mono text-xs outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
          />
          <p className="mt-1.5 text-xs text-ink-500">{t.broadcastProspectMessageHint}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-ink-700">
          <MessageCircle size={16} className="text-amtel-600" />
          <span className="font-medium">{t.broadcastProgress(sentCount, contacts.length)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void downloadBroadcastTemplate()}
            className="flex items-center gap-1.5 rounded-lg border border-ink-300 bg-white px-3.5 py-2 text-xs font-semibold text-ink-700 transition hover:bg-ink-100"
          >
            <Download size={13} />
            {t.importDownloadTemplate}
          </button>
          <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-amtel-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amtel-700">
            {importing ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
            {t.broadcastImportButton}
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFileChange}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {importError && (
        <div className="rounded-lg border border-amtel-200 bg-amtel-50 px-3 py-2.5 text-sm text-amtel-700">
          {importError}
        </div>
      )}

      {importSummary && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          {importSummary}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-ink-100 bg-white py-20">
          <Loader2 size={24} className="animate-spin text-amtel-600" />
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-amtel-200 bg-amtel-50 py-16 text-center">
          <AlertTriangle size={22} className="text-amtel-600" />
          <p className="font-medium text-amtel-700">{loadError}</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-300 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amtel-50 text-amtel-600">
            <MessageCircle size={22} />
          </div>
          <p className="font-medium text-ink-900">{t.broadcastEmptyTitle}</p>
          <p className="max-w-xs text-sm text-ink-500">{t.broadcastEmptySubtitle}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-100/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                  <th className="px-4 py-3">{t.colName}</th>
                  <th className="px-4 py-3">{t.colPhone}</th>
                  <th className="px-4 py-3">{t.colStatus}</th>
                  <th className="px-4 py-3 text-right">{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="transition hover:bg-ink-100/40">
                    <td className="px-4 py-3 font-medium text-ink-900">{contact.name}</td>
                    <td className="px-4 py-3 text-ink-700">
                      {contact.mainPhone}
                      {isProspectPhone(contact.mainPhone) && (
                        <span className="ml-1.5 inline-flex items-center rounded-full border border-ink-200 bg-ink-100/60 px-1.5 py-0.5 text-[10px] font-semibold text-ink-500">
                          {t.broadcastProspectTag}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {contact.sentAt ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 size={11} />
                            {t.broadcastSent}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-ink-200 bg-ink-100/60 px-2 py-0.5 text-[11px] font-semibold text-ink-500">
                            {t.broadcastNotSent}
                          </span>
                        )}
                        {contact.convertedCustomerId && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amtel-200 bg-amtel-50 px-2 py-0.5 text-[11px] font-semibold text-amtel-700">
                            <UserCheck size={11} />
                            {t.broadcastConverted}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSend(contact)}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                          <Send size={13} />
                          {contact.sentAt ? t.broadcastResend : t.broadcastSendAction}
                        </button>
                        <a
                          href={telHref(contact.mainPhone)}
                          className="flex items-center gap-1.5 rounded-lg bg-amtel-600 p-1.5 text-white shadow-sm transition hover:bg-amtel-700"
                          aria-label={t.actionCall}
                        >
                          <Phone size={14} />
                        </a>
                        <button
                          onClick={() => setEditTarget(contact)}
                          className="flex items-center gap-1.5 rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
                          aria-label={t.edit}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(contact)}
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

      {deleteTarget && (
        <ConfirmDialog
          title={t.broadcastDeleteTitle}
          message={t.broadcastDeleteMessage(deleteTarget.name)}
          confirmLabel={t.delete}
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {editTarget && (
        <EditContactModal contact={editTarget} onClose={() => setEditTarget(null)} />
      )}
    </div>
  );
}
