/* eslint-disable */
// Dedicated service worker for Firebase Cloud Messaging background push.
// Registered separately from the PWA's caching service worker (sw.js) —
// Firebase's SDK auto-registers this exact filename when getToken() is
// called client-side, so its name and location (site root) must not change.

importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

// Firebase web config values are not secret — they identify the project,
// not authorize access (that's what Firestore/Auth rules do).
firebase.initializeApp({
  apiKey: "AIzaSyD7MGty3bF7ETZN_jxExcXgXGgxZ61CBVk",
  authDomain: "c-service-73853.firebaseapp.com",
  projectId: "c-service-73853",
  storageBucket: "c-service-73853.firebasestorage.app",
  messagingSenderId: "851003418126",
  appId: "1:851003418126:web:d4832c6e83d25edaeafe5f",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? "Amtel CRM";
  const body = payload.notification?.body ?? "";
  self.registration.showNotification(title, {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
  });
});
