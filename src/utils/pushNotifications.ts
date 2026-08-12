import { getToken, onMessage } from "firebase/messaging";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, messaging } from "../firebase";

export type PushSetupResult = "enabled" | "denied" | "unsupported" | "error";

export async function enablePushNotifications(): Promise<PushSetupResult> {
  if (!messaging || !("Notification" in window)) return "unsupported";
  if (!auth.currentUser) return "error";

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "denied";

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) return "error";

  try {
    const token = await getToken(messaging, { vapidKey });
    if (!token) return "error";

    await setDoc(
      doc(db, "users", auth.currentUser.uid),
      { fcmToken: token, updatedAt: serverTimestamp() },
      { merge: true }
    );
    return "enabled";
  } catch {
    return "error";
  }
}

export function listenForForegroundMessages(
  onNotification: (title: string, body: string) => void
): () => void {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    onNotification(payload.notification?.title ?? "", payload.notification?.body ?? "");
  });
}
