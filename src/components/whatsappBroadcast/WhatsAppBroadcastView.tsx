import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  MessageCircle,
  Send,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useTenantId } from "../../context/AuthContext";
import {
  bulkAddBroadcastContacts,
  deleteBroadcastContact,
  getBroadcastContactsRealtime,
  markBroadcastContactSent,
} from "../../services/broadcastContactService";
import { downloadBroadcastTemplate, parseBroadcastContactsFile } from "../../utils/broadcastImport";
import { buildWhatsAppLink, fillTemplate } from "../../utils/whatsapp";
import type { BroadcastContact } from "../../types/broadcastContact";
import ConfirmDialog from "../common/ConfirmDialog";

const DEFAULT_MESSAGE = `Macmiil {{name}},

Kusoo dhawoow *Shirkada Isgaarsiinta Amtel*.

Macmiil, Shirkadu waxay samaysay *Qiimo Dhimis* dhanka xirmooyinka *Bulaal Unlimited*:

1: $0.5 = 60 Saacadood Aan Xadidnayn
2: $2 = Asbuuc Aan Xadidnayn

...iyo Xirmooyin kale.

Si aad ugu shubato ama aad xog dheeraad ah u hesho, la xiriir:
717701253 / 907701253

Macmiil, kusoo dhawoow adeeg ku qanciya.`;

export default function WhatsAppBroadcastView() {
  const { t } = useLanguage();
  const tenantId = useTenantId();
  const [contacts, setContacts] = useState<BroadcastContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BroadcastContact | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const sentCount = useMemo(() => contacts.filter((c) => c.sentAt).length, [contacts]);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImportError(null);
    setImporting(true);
    try {
      const rows = await parseBroadcastContactsFile(file);
      if (rows.length === 0) {
        setImportError(t.broadcastImportNoRows);
        return;
      }
      await bulkAddBroadcastContacts(tenantId, rows);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : t.broadcastImportFailed);
    } finally {
      setImporting(false);
    }
  }

  function handleSend(contact: BroadcastContact) {
    const link = buildWhatsAppLink(contact.phone, fillTemplate(message, contact.name));
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

      <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm">
        <label className="mb-2 block text-sm font-semibold text-ink-900">
          {t.broadcastMessageLabel}
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={11}
          className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 font-mono text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
        />
        <p className="mt-1.5 text-xs text-ink-500">{t.broadcastMessageHint}</p>
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
                    <td className="px-4 py-3 text-ink-700">{contact.phone}</td>
                    <td className="px-4 py-3">
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
    </div>
  );
}
