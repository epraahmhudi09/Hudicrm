import { useState, type FormEvent } from "react";
import { LogIn, Loader2, AlertCircle, Eye, EyeOff, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import type { Translations } from "../../i18n/translations";
import Logo from "../layout/Logo";

function friendlyAuthError(code: string, t: Translations): string {
  switch (code) {
    case "auth/invalid-email":
      return t.authErrorInvalidEmail;
    case "auth/user-disabled":
      return t.authErrorUserDisabled;
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return t.authErrorWrongCredentials;
    case "auth/too-many-requests":
      return t.authErrorTooManyRequests;
    case "auth/configuration-not-found":
      return t.authErrorConfigNotFound;
    case "auth/network-request-failed":
      return t.authErrorNetwork;
    default:
      return t.authErrorGeneric;
  }
}

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<"login" | "forgotPassword">("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resetError, setResetError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(friendlyAuthError(code, t));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReset = async (e: FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetStatus("sending");
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetStatus("sent");
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setResetError(friendlyAuthError(code, t));
      setResetStatus("error");
    }
  };

  if (view === "forgotPassword") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-ink-100 p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center">
            <Logo variant="dark" />
          </div>

          <button
            onClick={() => {
              setView("login");
              setResetStatus("idle");
              setResetError(null);
            }}
            className="mb-6 flex items-center gap-1.5 text-sm font-medium text-ink-500 transition hover:text-ink-700"
          >
            <ArrowLeft size={15} />
            {t.backToSignIn}
          </button>

          {resetStatus === "sent" ? (
            <div className="rounded-xl border border-ink-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="text-lg font-semibold text-ink-900">{t.resetEmailSentTitle}</h2>
              <p className="mt-1.5 text-sm text-ink-500">{t.resetEmailSentSubtitle(resetEmail.trim())}</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-ink-900">{t.forgotPasswordTitle}</h2>
              <p className="mt-1 mb-8 text-sm text-ink-500">{t.forgotPasswordSubtitle}</p>

              <form onSubmit={handleSendReset} className="space-y-4">
                <div>
                  <label htmlFor="resetEmail" className="mb-1.5 block text-sm font-medium text-ink-700">
                    {t.emailAddress}
                  </label>
                  <input
                    id="resetEmail"
                    type="email"
                    required
                    autoComplete="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@amtel.com"
                    className="w-full rounded-lg border border-ink-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-500/60 outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
                  />
                </div>

                {resetError && (
                  <div className="flex items-start gap-2 rounded-lg bg-amtel-50 border border-amtel-200 px-3 py-2.5 text-sm text-amtel-700">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{resetError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetStatus === "sending"}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-amtel-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amtel-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resetStatus === "sending" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Mail size={16} />
                  )}
                  {t.sendResetLink}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-ink-100">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-amtel-600 to-amtel-800">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Logo variant="light" className="scale-125 origin-left" />
          <div className="max-w-md">
            <h1 className="text-3xl font-bold leading-tight mb-3">{t.loginHeroTitle}</h1>
            <p className="text-white/80">{t.loginHeroSubtitle}</p>
          </div>
          <p className="text-xs text-white/60">{t.loginCopyright(new Date().getFullYear())}</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between lg:justify-end mb-8">
            <div className="lg:hidden flex justify-center flex-1">
              <Logo variant="dark" />
            </div>
            <LanguageToggle />
          </div>

          <h2 className="text-2xl font-bold text-ink-900">{t.welcomeBack}</h2>
          <p className="text-sm text-ink-500 mt-1 mb-8">{t.signInSubtitle}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-ink-700 mb-1.5"
              >
                {t.emailAddress}
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@amtel.com"
                className="w-full rounded-lg border border-ink-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-500/60 outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ink-700 mb-1.5"
              >
                {t.password}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-ink-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-ink-900 placeholder:text-ink-500/60 outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setView("forgotPassword")}
                className="mt-1.5 text-xs font-medium text-amtel-600 transition hover:text-amtel-700"
              >
                {t.forgotPasswordLink}
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-amtel-50 border border-amtel-200 px-3 py-2.5 text-sm text-amtel-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-amtel-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amtel-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {submitting ? t.signingIn : t.signIn}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-ink-500">{t.accessRestricted}</p>
        </div>
      </div>
    </div>
  );
}

function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex rounded-lg border border-ink-300 p-0.5 text-xs font-medium">
      <button
        type="button"
        onClick={() => setLanguage("so")}
        className={`rounded-md px-2 py-1 transition ${
          language === "so" ? "bg-amtel-600 text-white" : "text-ink-500"
        }`}
      >
        SO
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-md px-2 py-1 transition ${
          language === "en" ? "bg-amtel-600 text-white" : "text-ink-500"
        }`}
      >
        EN
      </button>
    </div>
  );
}
