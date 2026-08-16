import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { onQuerySnapshotWithRetry } from "../utils/firestoreRetry";
import type {
  ActivityType,
  Customer,
  CustomerActivity,
  CustomerFormData,
  CustomerStatus,
} from "../types/customer";

const CUSTOMERS_COLLECTION = "customers";
const customersRef = collection(db, CUSTOMERS_COLLECTION);

// Firestore batched writes are capped at 500 operations; stay well under that.
const BATCH_CHUNK_SIZE = 450;

function bundleExpiryToTimestamp(value: string): Timestamp | null {
  return value ? Timestamp.fromDate(new Date(`${value}T00:00:00`)) : null;
}

function toFirestoreCustomerData(data: CustomerFormData) {
  const { bundleExpiry, bundleId, ...rest } = data;
  return {
    ...rest,
    bundleExpiry: bundleExpiryToTimestamp(bundleExpiry),
    bundleId: bundleId || null,
  };
}

export async function addCustomer(
  tenantId: string,
  data: CustomerFormData,
  createdAt?: Date
): Promise<string> {
  const docRef = await addDoc(customersRef, {
    ...toFirestoreCustomerData(data),
    tenantId,
    createdAt: createdAt ? Timestamp.fromDate(createdAt) : serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export interface BulkImportResult {
  successCount: number;
}

export async function bulkAddCustomers(
  tenantId: string,
  rows: Array<{ data: CustomerFormData; createdAt?: Date | null }>
): Promise<BulkImportResult> {
  let successCount = 0;

  for (let i = 0; i < rows.length; i += BATCH_CHUNK_SIZE) {
    const chunk = rows.slice(i, i + BATCH_CHUNK_SIZE);
    const batch = writeBatch(db);

    for (const row of chunk) {
      const newDocRef = doc(customersRef);
      batch.set(newDocRef, {
        ...toFirestoreCustomerData(row.data),
        tenantId,
        createdAt: row.createdAt ? Timestamp.fromDate(row.createdAt) : serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
    successCount += chunk.length;
  }

  return { successCount };
}

export function getCustomersRealtime(
  tenantId: string,
  onData: (customers: Customer[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(customersRef, where("tenantId", "==", tenantId));

  return onQuerySnapshotWithRetry(
    q,
    (snapshot) => {
      const customers = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        // Pending writes resolve serverTimestamp() to null until the server acks it;
        // "estimate" fills it with the client's local clock so the UI doesn't flash "—".
        ...docSnap.data({ serverTimestamps: "estimate" }),
      })) as Customer[];
      // Sorted client-side rather than via orderBy() in the query — an
      // equality filter (tenantId) plus orderBy on a different field
      // (createdAt) needs a composite index, which isn't provisionable here.
      customers.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
      onData(customers);
    },
    onError
  );
}

export async function updateCustomer(
  id: string,
  data: CustomerFormData
): Promise<void> {
  const customerDoc = doc(db, CUSTOMERS_COLLECTION, id);
  await updateDoc(customerDoc, {
    ...toFirestoreCustomerData(data),
    updatedAt: serverTimestamp(),
  });
}

export async function toggleCustomerStatus(
  id: string,
  currentStatus: CustomerStatus
): Promise<CustomerStatus> {
  const nextStatus: CustomerStatus = currentStatus === "loyal" ? "normal" : "loyal";
  const customerDoc = doc(db, CUSTOMERS_COLLECTION, id);
  await updateDoc(customerDoc, {
    status: nextStatus,
    updatedAt: serverTimestamp(),
  });
  return nextStatus;
}

export async function deleteCustomer(id: string): Promise<void> {
  const customerDoc = doc(db, CUSTOMERS_COLLECTION, id);
  await deleteDoc(customerDoc);
}

export async function logActivity(
  customerId: string,
  type: ActivityType,
  message: string
): Promise<void> {
  const activitiesRef = collection(db, CUSTOMERS_COLLECTION, customerId, "activities");
  await addDoc(activitiesRef, {
    type,
    message,
    createdBy: auth.currentUser?.email ?? "unknown",
    createdAt: serverTimestamp(),
  });
}

export function getActivitiesRealtime(
  customerId: string,
  onData: (activities: CustomerActivity[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const activitiesRef = collection(db, CUSTOMERS_COLLECTION, customerId, "activities");
  const q = query(activitiesRef, orderBy("createdAt", "desc"));

  return onQuerySnapshotWithRetry(
    q,
    (snapshot) => {
      const activities = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data({ serverTimestamps: "estimate" }),
      })) as CustomerActivity[];
      onData(activities);
    },
    onError
  );
}
