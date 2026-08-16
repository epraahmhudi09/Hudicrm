import {
  onSnapshot,
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  type Query,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { auth } from "../firebase";

/**
 * Right after a hard refresh, Firebase Auth's ID token can still be
 * attaching to the connection when a Firestore listener tries to subscribe,
 * which reads as a permission-denied even though the user is genuinely
 * signed in. Forcing a token fetch first (this resolves once a valid token
 * is available, refreshing if needed — it's a no-op if one's already
 * attached) closes that race at the source, instead of just reacting to it
 * after the fact.
 */
async function ensureAuthReady(): Promise<void> {
  try {
    await auth.currentUser?.getIdToken();
  } catch {
    // If this fails, the subscribe attempt below will too, and the retry
    // loop takes over from there.
  }
}

/**
 * Even with the token pre-fetch above, onSnapshot's error callback still
 * terminates that listener permanently — it does not resubscribe on its
 * own — so any other transient hiccup (a slow network, a brief disconnect)
 * would otherwise leave the UI stuck on an error or an infinite loading
 * screen until the user manually refreshes. Retries happen silently;
 * onError only fires once every attempt is spent.
 */
function withRetry<TSnapshot>(
  subscribeOnce: (
    onData: (snapshot: TSnapshot) => void,
    onError: (error: Error) => void
  ) => Unsubscribe,
  onData: (snapshot: TSnapshot) => void,
  onError?: (error: Error) => void,
  options: { retries?: number } = {}
): Unsubscribe {
  const { retries = 8 } = options;
  let unsubscribed = false;
  let attempt = 0;
  let currentUnsubscribe: Unsubscribe = () => {};

  // Starts fast (so a one-off blip clears almost instantly) and backs off
  // up to 3s a step, giving ~20s of total silent-retry budget by the last
  // attempt — comfortable room for a slow mobile connection to finish
  // attaching the auth token before anything is shown to the user.
  function delayFor(attemptIndex: number): number {
    return Math.min(500 * 2 ** attemptIndex, 3000);
  }

  function subscribe() {
    currentUnsubscribe = subscribeOnce(
      (snapshot) => {
        attempt = 0;
        onData(snapshot);
      },
      (error) => {
        if (unsubscribed) return;
        if (attempt < retries) {
          const delay = delayFor(attempt);
          attempt++;
          setTimeout(() => {
            if (!unsubscribed) subscribe();
          }, delay);
        } else {
          onError?.(error);
        }
      }
    );
  }

  void ensureAuthReady().then(() => {
    if (!unsubscribed) subscribe();
  });

  return () => {
    unsubscribed = true;
    currentUnsubscribe();
  };
}

export function onQuerySnapshotWithRetry<T = DocumentData>(
  query: Query<T>,
  onData: (snapshot: QuerySnapshot<T>) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return withRetry(
    (data, error) => onSnapshot(query, data, error),
    onData,
    onError
  );
}

export function onDocSnapshotWithRetry<T = DocumentData>(
  ref: DocumentReference<T>,
  onData: (snapshot: DocumentSnapshot<T>) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return withRetry(
    (data, error) => onSnapshot(ref, data, error),
    onData,
    onError
  );
}
