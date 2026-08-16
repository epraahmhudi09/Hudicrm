import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase";
import { onQuerySnapshotWithRetry } from "../utils/firestoreRetry";
import type { Bundle, BundleFormData } from "../types/bundle";

const BUNDLES_COLLECTION = "bundles";
const bundlesRef = collection(db, BUNDLES_COLLECTION);

function toFirestoreBundleData(data: BundleFormData) {
  return {
    name: data.name,
    amount: Number(data.amount),
    durationValue: Number(data.durationValue),
    durationUnit: data.durationUnit,
  };
}

export async function addBundle(tenantId: string, data: BundleFormData): Promise<string> {
  const docRef = await addDoc(bundlesRef, {
    ...toFirestoreBundleData(data),
    tenantId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export function getBundlesRealtime(
  tenantId: string,
  onData: (bundles: Bundle[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(bundlesRef, where("tenantId", "==", tenantId));

  return onQuerySnapshotWithRetry(
    q,
    (snapshot) => {
      const bundles = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data({ serverTimestamps: "estimate" }),
      })) as Bundle[];
      bundles.sort((a, b) => a.amount - b.amount);
      onData(bundles);
    },
    onError
  );
}

export async function updateBundle(id: string, data: BundleFormData): Promise<void> {
  const bundleDoc = doc(db, BUNDLES_COLLECTION, id);
  await updateDoc(bundleDoc, {
    ...toFirestoreBundleData(data),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBundle(id: string): Promise<void> {
  const bundleDoc = doc(db, BUNDLES_COLLECTION, id);
  await deleteDoc(bundleDoc);
}
