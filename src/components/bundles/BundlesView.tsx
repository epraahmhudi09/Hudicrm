import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Package, Plus, Sparkles } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import {
  addBundle,
  deleteBundle,
  getBundlesRealtime,
  updateBundle,
} from "../../services/bundleService";
import type { Bundle, BundleFormData, DurationUnit } from "../../types/bundle";
import { DEFAULT_BUNDLE_TIERS } from "../../utils/parseEvcSms";
import BundleTable from "./BundleTable";
import BundleForm from "./BundleForm";
import ConfirmDialog from "../common/ConfirmDialog";

// Confirmed pricing for the Tanaad (data) and Bulaal Lite catalogs, which
// share several $ amounts with the original airtime tiers and each other
// (e.g. $0.5 = 36hrs airtime / 3GB Tanaad / 60hrs Bulaal Lite) — that's
// exactly why customers need to be individually pinned to one of these via
// the "Assigned Bundle" field on their record instead of relying on price
// alone.
const TANAAD_BULAAL_CATALOG: Array<{
  name: string;
  amount: number;
  durationValue: number;
  durationUnit: DurationUnit;
}> = [
  { name: "Tanaad 1700MB", amount: 0.1, durationValue: 7, durationUnit: "days" },
  { name: "Tanaad 1.5GB", amount: 0.25, durationValue: 7, durationUnit: "days" },
  { name: "Tanaad 3GB", amount: 0.5, durationValue: 7, durationUnit: "days" },
  { name: "Tanaad 10GB", amount: 1, durationValue: 7, durationUnit: "days" },
  { name: "Tanaad 20GB", amount: 3, durationValue: 1, durationUnit: "months" },
  { name: "Tanaad 45GB", amount: 5, durationValue: 1, durationUnit: "months" },
  { name: "Tanaad 80GB", amount: 8, durationValue: 1, durationUnit: "months" },
  { name: "Bulaal Lite (60hrs)", amount: 0.5, durationValue: 60, durationUnit: "hours" },
  { name: "Bulaal Lite (Weekly)", amount: 2, durationValue: 7, durationUnit: "days" },
];

export default function BundlesView() {
  const { t } = useLanguage();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedingCatalog, setSeedingCatalog] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Bundle | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = getBundlesRealtime(
      (data) => {
        setBundles(data);
        setLoading(false);
        setLoadError(null);
      },
      (error) => {
        setLoadError(error.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  function openAddForm() {
    setEditingBundle(null);
    setFormOpen(true);
  }

  function openEditForm(bundle: Bundle) {
    setEditingBundle(bundle);
    setFormOpen(true);
  }

  async function handleFormSubmit(data: BundleFormData) {
    if (editingBundle) {
      await updateBundle(editingBundle.id, data);
    } else {
      await addBundle(data);
    }
    setFormOpen(false);
    setEditingBundle(null);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBundle(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  async function handleLoadDefaults() {
    setSeeding(true);
    try {
      for (const tier of DEFAULT_BUNDLE_TIERS) {
        await addBundle({
          name: "",
          amount: String(tier.amount),
          durationValue: String(tier.durationValue),
          durationUnit: tier.durationUnit,
        });
      }
    } finally {
      setSeeding(false);
    }
  }

  async function handleLoadTanaadBulaal() {
    setSeedingCatalog(true);
    try {
      const existing = new Set(bundles.map((b) => `${b.name}|${b.amount}`));
      for (const entry of TANAAD_BULAAL_CATALOG) {
        if (existing.has(`${entry.name}|${entry.amount}`)) continue;
        await addBundle({
          name: entry.name,
          amount: String(entry.amount),
          durationValue: String(entry.durationValue),
          durationUnit: entry.durationUnit,
        });
      }
    } finally {
      setSeedingCatalog(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900">{t.bundlesTitle}</h1>
          <p className="mt-0.5 text-sm text-ink-500">{t.bundlesSubtitle}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            onClick={() => void handleLoadTanaadBulaal()}
            disabled={seedingCatalog}
            className="flex items-center gap-2 rounded-lg border border-ink-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 shadow-sm transition hover:bg-ink-100 disabled:opacity-60"
          >
            {seedingCatalog ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} className="text-amtel-600" />
            )}
            {t.loadTanaadBulaalPricing}
          </button>
          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-amtel-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amtel-700"
          >
            <Plus size={16} />
            {t.addBundle}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-ink-100 bg-white py-20">
          <Loader2 size={24} className="animate-spin text-amtel-600" />
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-amtel-200 bg-amtel-50 py-16 text-center">
          <AlertTriangle size={22} className="text-amtel-600" />
          <p className="font-medium text-amtel-700">{t.couldntLoadBundles}</p>
          <p className="max-w-sm text-sm text-amtel-600">{loadError}</p>
        </div>
      ) : bundles.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-300 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amtel-50 text-amtel-600">
            <Package size={22} />
          </div>
          <p className="font-medium text-ink-900">{t.bundleEmptyTitle}</p>
          <p className="max-w-xs text-sm text-ink-500">{t.bundleEmptySubtitle}</p>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={openAddForm}
              className="rounded-lg bg-amtel-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amtel-700"
            >
              {t.addBundle}
            </button>
            <button
              onClick={() => void handleLoadDefaults()}
              disabled={seeding}
              className="flex items-center gap-2 rounded-lg border border-ink-300 bg-white px-4 py-2 text-sm font-semibold text-ink-700 shadow-sm transition hover:bg-ink-100 disabled:opacity-60"
            >
              {seeding ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} className="text-amtel-600" />
              )}
              {t.loadDefaultPricing}
            </button>
          </div>
        </div>
      ) : (
        <BundleTable bundles={bundles} onEdit={openEditForm} onDelete={setDeleteTarget} />
      )}

      {formOpen && (
        <BundleForm
          bundle={editingBundle}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setFormOpen(false);
            setEditingBundle(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={t.deleteBundleTitle}
          message={t.deleteBundleMessage(deleteTarget.name || `$${deleteTarget.amount.toFixed(2)}`)}
          confirmLabel={t.delete}
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
