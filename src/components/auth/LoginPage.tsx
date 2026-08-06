import { useState, type FormEvent } from "react";
import { LogIn, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Logo from "../layout/Logo";

function friendlyAuthError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/configuration-not-found":
      return "Email/Password sign-in isn't enabled for this Firebase project yet. Enable it in the Firebase Console under Authentication → Sign-in method.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Sign in failed. Please try again.";
  }
}

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(friendlyAuthError(code));
    } finally {
      setSubmitting(false);
    }
  };

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
            <h1 className="text-3xl font-bold leading-tight mb-3">
              Manage every customer relationship in one place.
            </h1>
            <p className="text-white/80">
              Track subscriptions, loyalty status, and contact details for
              every Amtel customer — in real time.
            </p>
          </div>
          <p className="text-xs text-white/60">
            &copy; {new Date().getFullYear()} Amtel. All rights reserved.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo variant="dark" />
          </div>

          <h2 className="text-2xl font-bold text-ink-900">Welcome back</h2>
          <p className="text-sm text-ink-500 mt-1 mb-8">
            Sign in to access the Amtel CRM dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-ink-700 mb-1.5"
              >
                Email address
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
                Password
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
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-ink-500">
            Access is restricted to authorized Amtel staff.
          </p>
        </div>
      </div>
    </div>
  );
}
