import { useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  Bell,
  Camera,
  Check,
  Copy,
  Languages,
  Loader2,
  UserCircle,
} from "lucide-react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useAuth, useTenantId } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { resizeImageToDataUrl } from "../../utils/imageResize";
import { enablePushNotifications, type PushSetupResult } from "../../utils/pushNotifications";
import { getTenant } from "../../services/tenantService";
import type { Tenant } from "../../types/tenant";

function friendlyError(code: string): string {
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Current password is incorrect.";
    case "auth/weak-password":
      return "New password must be at least 6 characters.";
    case "auth/requires-recent-login":
      return "Please sign out and back in, then try changing your password again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

type SectionStatus = "idle" | "saving" | "success" | "error";

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-ink-900">{title}</h2>
      {children}
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

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

function SmsAutomationCard() {
  const { t } = useLanguage();
  const tenantId = useTenantId();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getTenant(tenantId)
      .then((data) => {
        if (!cancelled) setTenant(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <SettingsCard title={t.smsAutomationTitle}>
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 size={18} className="animate-spin text-amtel-600" />
        </div>
      ) : !tenant ? (
        <p className="text-sm text-ink-500">{t.couldntLoadUsers}</p>
      ) : (
        <div className="space-y-3">
          <CopyRow label={t.webhookTokenLabel} value={tenant.webhookToken} />
          <CopyRow label="sms-webhook" value={`${origin}/api/sms-webhook`} />
          <CopyRow label="pending-sms" value={`${origin}/api/pending-sms`} />
          <CopyRow label="mark-sms-sent" value={`${origin}/api/mark-sms-sent`} />
        </div>
      )}
    </SettingsCard>
  );
}

export default function SettingsView() {
  const { user, profilePhoto, refreshUser } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [name, setName] = useState(user?.displayName ?? "");
  const [nameStatus, setNameStatus] = useState<SectionStatus>("idle");
  const [nameError, setNameError] = useState<string | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarStatus, setAvatarStatus] = useState<SectionStatus>("idle");
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<SectionStatus>("idle");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [notifStatus, setNotifStatus] = useState<SectionStatus>("idle");
  const [notifResult, setNotifResult] = useState<PushSetupResult | null>(null);

  async function handleEnableNotifications() {
    setNotifStatus("saving");
    const result = await enablePushNotifications();
    setNotifResult(result);
    setNotifStatus(result === "enabled" ? "success" : "error");
  }

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    if (!auth.currentUser || !name.trim()) return;
    setNameStatus("saving");
    setNameError(null);
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      await refreshUser();
      setNameStatus("success");
      setTimeout(() => setNameStatus("idle"), 2000);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : "Couldn't update name.");
      setNameStatus("error");
    }
  }

  async function handleAvatarChange(file: File) {
    if (!auth.currentUser) return;
    setAvatarError(null);
    setAvatarStatus("saving");
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setAvatarPreview(dataUrl);
      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        { photoDataUrl: dataUrl, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setAvatarStatus("success");
      setTimeout(() => setAvatarStatus("idle"), 2000);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Couldn't upload that image.");
      setAvatarStatus("error");
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    if (!auth.currentUser?.email) return;

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      setPasswordStatus("error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match.");
      setPasswordStatus("error");
      return;
    }

    setPasswordStatus("saving");
    setPasswordError(null);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setPasswordStatus("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordStatus("idle"), 2000);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setPasswordError(friendlyError(code));
      setPasswordStatus("error");
    }
  }

  const displayedAvatar = avatarPreview ?? profilePhoto;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">{t.settingsTitle}</h1>
        <p className="mt-0.5 text-sm text-ink-500">{t.settingsSubtitle}</p>
      </div>

      <SettingsCard title={t.editProfileTitle}>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-ink-100 text-ink-400">
              {displayedAvatar ? (
                <img src={displayedAvatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <UserCircle size={40} />
              )}
            </div>
            <label className="absolute -right-1 -bottom-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-amtel-600 text-white shadow-sm transition hover:bg-amtel-700">
              <Camera size={12} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void handleAvatarChange(file);
                }}
              />
            </label>
          </div>
          <form onSubmit={handleSaveName} className="w-full flex-1 space-y-1.5">
            <label htmlFor="displayName" className="block text-sm font-medium text-ink-700">
              {t.displayName}
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="displayName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.yourName}
                className="flex-1 rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
              />
              <button
                type="submit"
                disabled={nameStatus === "saving" || !name.trim()}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-amtel-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-amtel-700 disabled:cursor-not-allowed disabled:opacity-60 sm:justify-start"
              >
                {nameStatus === "saving" && <Loader2 size={14} className="animate-spin" />}
                {t.save}
              </button>
            </div>
          </form>
        </div>
        {avatarStatus === "saving" && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
            <Loader2 size={12} className="animate-spin" /> {t.uploading}
          </p>
        )}
        {avatarStatus === "success" && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
            <Check size={12} /> {t.avatarUpdated}
          </p>
        )}
        {avatarError && <p className="mt-2 text-xs text-amtel-600">{avatarError}</p>}
        {nameStatus === "success" && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
            <Check size={12} /> {t.nameUpdated}
          </p>
        )}
        {nameError && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-amtel-600">
            <AlertCircle size={12} /> {nameError}
          </p>
        )}
      </SettingsCard>

      <SettingsCard title={t.changePassword}>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t.currentPassword}
            autoComplete="current-password"
            className="w-full rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t.newPassword}
            autoComplete="new-password"
            className="w-full rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t.confirmNewPassword}
            autoComplete="new-password"
            className="w-full rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
          />
          <button
            type="submit"
            disabled={passwordStatus === "saving" || !currentPassword || !newPassword}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-amtel-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amtel-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {passwordStatus === "saving" && <Loader2 size={14} className="animate-spin" />}
            {t.updatePassword}
          </button>
          {passwordStatus === "success" && (
            <p className="flex items-center gap-1.5 text-xs text-green-600">
              <Check size={12} /> {t.passwordUpdated}
            </p>
          )}
          {passwordError && (
            <p className="flex items-center gap-1.5 text-xs text-amtel-600">
              <AlertCircle size={12} /> {passwordError}
            </p>
          )}
        </form>
      </SettingsCard>

      <SettingsCard title={t.notifTitle}>
        <button
          type="button"
          onClick={() => void handleEnableNotifications()}
          disabled={notifStatus === "saving"}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-ink-300 px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {notifStatus === "saving" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Bell size={14} />
          )}
          {t.notifEnable}
        </button>
        {notifStatus === "success" && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
            <Check size={12} /> {t.notifEnabled}
          </p>
        )}
        {notifStatus === "error" && notifResult && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-amtel-600">
            <AlertCircle size={12} />
            {notifResult === "denied" && t.notifDenied}
            {notifResult === "unsupported" && t.notifUnsupported}
            {notifResult === "error" && t.notifError}
          </p>
        )}
      </SettingsCard>

      <SmsAutomationCard />

      <SettingsCard title={t.settingsLanguage}>
        <div className="flex items-center gap-3">
          <Languages size={16} className="text-ink-500" />
          <div className="flex rounded-lg border border-ink-300 p-0.5 text-sm">
            <button
              type="button"
              onClick={() => setLanguage("so")}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                language === "so" ? "bg-amtel-600 text-white" : "text-ink-600 hover:bg-ink-100"
              }`}
            >
              Soomaali
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                language === "en" ? "bg-amtel-600 text-white" : "text-ink-600 hover:bg-ink-100"
              }`}
            >
              English
            </button>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
