import {
  onSnapshot,
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  type Query,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";

/**
 * Once onSnapshot's error callback fires, Firestore terminates that
 * listener permanently — it does not resubscribe on its own. Right after a
 * fresh page load, the very first listener can hit a transient
 * permission-denied simply because Firebase Auth's ID token hasn't finished
 * attaching to the connection yet (a known race between Auth session
 * rehydration and Firestore's own connection setup); without a retry, that
 * one-time hiccup — even though the permissions are actually fine a moment
 * later — leaves the UI showing an error, or stuck loading forever, until
 * the user manually refreshes. Retries happen silently; onError only fires
 * once every attempt is spent.
 */
function withRetry<TSnapshot>(
  subscribeOnce: (
    onData: (snapshot: TSnapshot) => void,
    onError: (error: Error) => void
  ) => Unsubscribe,
  onData: (snapshot: TSnapshot) => void,
  onError?: (error: Error) => void,
  options: { retries?: number; retryDelayMs?: number } = {}
): Unsubscribe {
  const { retries = 3, retryDelayMs = 1200 } = options;
  let unsubscribed = false;
  let attemptsLeft = retries;
  let currentUnsubscribe: Unsubscribe = () => {};

  function subscribe() {
    currentUnsubscribe = subscribeOnce(
      (snapshot) => {
        attemptsLeft = retries;
        onData(snapshot);
      },
      (error) => {
        if (unsubscribed) return;
        if (attemptsLeft > 0) {
          attemptsLeft--;
          setTimeout(() => {
            if (!unsubscribed) subscribe();
          }, retryDelayMs);
        } else {
          onError?.(error);
        }
      }
    );
  }

  subscribe();

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
