import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase";
import type { DebtCustomer, DebtCustomerFormData } from "../types/debtCustomer";

const DEBT_CUSTOMERS_COLLECTION = "debtCustomers";
const debtCustomersRef = collection(db, DEBT_CUSTOMERS_COLLECTION);

function toFirestoreDebtCustomerData(data: DebtCustomerFormData) {
  return {
    name: data.name,
    phone: data.phone,
    backupPhone: data.backupPhone,
    amount: Number(data.amount),
  };
}

export async function addDebtCustomer(
  tenantId: string,
  data: DebtCustomerFormData
): Promise<string> {
  const docRef = await addDoc(debtCustomersRef, {
    ...toFirestoreDebtCustomerData(data),
    tenantId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export function getDebtCustomersRealtime(
  tenantId: string,
  onData: (debtCustomers: DebtCustomer[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(debtCustomersRef, where("tenantId", "==", tenantId));

  return onSnapshot(
    q,
    (snapshot) => {
      const debtCustomers = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        // Pending writes resolve serverTimestamp() to null until the server acks it;
        // "estimate" fills it with the client's local clock so the UI doesn't flash "—".
        ...docSnap.data({ serverTimestamps: "estimate" }),
      })) as DebtCustomer[];
      debtCustomers.sort(
        (a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)
      );
      onData(debtCustomers);
    },
    (error) => {
      onError?.(error);
    }
  );
}

export async function updateDebtCustomer(id: string, data: DebtCustomerFormData): Promise<void> {
  const debtCustomerDoc = doc(db, DEBT_CUSTOMERS_COLLECTION, id);
  await updateDoc(debtCustomerDoc, {
    ...toFirestoreDebtCustomerData(data),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDebtCustomer(id: string): Promise<void> {
  const debtCustomerDoc = doc(db, DEBT_CUSTOMERS_COLLECTION, id);
  await deleteDoc(debtCustomerDoc);
}
