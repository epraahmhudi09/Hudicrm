import { collection, doc, query, updateDoc, where, type Unsubscribe } from "firebase/firestore";
import { db } from "../firebase";
import { onQuerySnapshotWithRetry } from "../utils/firestoreRetry";
import type { FraudAlert } from "../types/fraudAlert";

const FRAUD_ALERTS_COLLECTION = "fraudAlerts";

export function getFraudAlertsRealtime(
  tenantId: string,
  onData: (alerts: FraudAlert[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, FRAUD_ALERTS_COLLECTION), where("tenantId", "==", tenantId));

  return onQuerySnapshotWithRetry(
    q,
    (snapshot) => {
      const alerts = snapshot.docs.map(
        (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as FraudAlert
      );
      alerts.sort((a, b) => (b.detectedAt?.toMillis() ?? 0) - (a.detectedAt?.toMillis() ?? 0));
      onData(alerts);
    },
    onError
  );
}

export async function markFraudAlertReviewed(id: string): Promise<void> {
  await updateDoc(doc(db, FRAUD_ALERTS_COLLECTION, id), { reviewed: true });
}
