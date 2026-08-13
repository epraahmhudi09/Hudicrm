import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase";
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

export async function addBundle(data: BundleFormData): Promise<string> {
  const docRef = await addDoc(bundlesRef, {
    ...toFirestoreBundleData(data),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export function getBundlesRealtime(
  onData: (bundles: Bundle[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(bundlesRef, orderBy("amount", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const bundles = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data({ serverTimestamps: "estimate" }),
      })) as Bundle[];
      onData(bundles);
    },
    (error) => {
      onError?.(error);
    }
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
