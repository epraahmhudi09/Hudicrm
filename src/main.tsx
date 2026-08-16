import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useRegisterSW } from 'virtual:pwa-register/react'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { LanguageProvider } from './context/LanguageContext.tsx'

// The default injected registerSW.js only calls navigator.serviceWorker.register()
// — it never reloads an already-open tab once a newer deploy's service worker
// takes over, so that tab keeps running whatever JS it already loaded until
// some unrelated future navigation. That's what made bug fixes look flaky
// right after shipping: a refresh could land on either the old or the new
// version depending on exactly when the new service worker finished
// activating. Reloading immediately once a new version is detected closes
// that gap — a refresh always gets the version that's actually live.
function ServiceWorkerUpdater() {
  const { updateServiceWorker } = useRegisterSW({
    onNeedRefresh() {
      void updateServiceWorker(true);
    },
  });
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ServiceWorkerUpdater />
    <LanguageProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
)
