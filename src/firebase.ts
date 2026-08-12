import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getMessaging, isSupported as isMessagingSupported, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);

// Auto-detects when Firestore's streaming (WebChannel) connection is being
// blocked or throttled by a proxy/firewall/sandbox and falls back to HTTP
// long-polling instead of hanging indefinitely.
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});

export const auth = getAuth(app);

// Analytics only works in a browser context that supports it (no SSR, no unsupported browsers).
export let analytics: Analytics | undefined;
isSupported()
  .then((supported) => {
    if (supported) analytics = getAnalytics(app);
  })
  .catch(() => {
    // Analytics is optional — ignore environments where it can't initialize.
  });

// Push messaging needs a real browser with service worker + Notification
// support (unavailable in some in-app browsers, older Safari, etc.).
export let messaging: Messaging | undefined;
isMessagingSupported()
  .then((supported) => {
    if (supported) messaging = getMessaging(app);
  })
  .catch(() => {
    // Messaging is optional — ignore environments where it can't initialize.
  });
