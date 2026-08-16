import { Loader2 } from "lucide-react";

// Shown during the auth/profile loading gates in App.tsx — a branded
// launch screen instead of a bare spinner, so the various backend
// connection steps (Firebase Auth resolving, the Firestore profile fetch
// and its own retry window) happen behind one intentional-looking screen
// rather than flickering through generic "something is loading" states.
export default function SplashScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-amtel-600 to-amtel-800 px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <svg
          width="56"
          height="56"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3 29C10 27 15 23 19 16C21.5 11.5 23.5 7 27 3C24 12 24 20 27 29C22 25 17 25 12 27C9 28.2 6 28.8 3 29Z"
            fill="#ffffff"
          />
        </svg>
        <span className="text-4xl font-extrabold tracking-tight text-white">HD CRM</span>
      </div>
      <p className="max-w-xs text-sm font-medium italic text-white/80">
        Every customer, crystal clear.
      </p>
      <Loader2 size={22} className="animate-spin text-white/70" />
    </div>
  );
}
