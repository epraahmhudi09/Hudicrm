import {
  collection,
  deleteDoc,
  doc,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase";
import { onQuerySnapshotWithRetry } from "../utils/firestoreRetry";
import type { BroadcastContact } from "../types/broadcastContact";

const BROADCAST_CONTACTS_COLLECTION = "broadcastContacts";
const contactsRef = collection(db, BROADCAST_CONTACTS_COLLECTION);

// Firestore batched writes are capped at 500 operations; stay well under that.
const BATCH_CHUNK_SIZE = 450;

export async function bulkAddBroadcastContacts(
  tenantId: string,
  rows: Array<{ name: string; phone: string }>
): Promise<{ successCount: number }> {
  let successCount = 0;

  for (let i = 0; i < rows.length; i += BATCH_CHUNK_SIZE) {
    const chunk = rows.slice(i, i + BATCH_CHUNK_SIZE);
    const batch = writeBatch(db);

    for (const row of chunk) {
      const newDocRef = doc(contactsRef);
      batch.set(newDocRef, {
        tenantId,
        name: row.name,
        phone: row.phone,
        sentAt: null,
        createdAt: serverTimestamp(),
      });
    }

    await batch.commit();
    successCount += chunk.length;
  }

  return { successCount };
}

export function getBroadcastContactsRealtime(
  tenantId: string,
  onData: (contacts: BroadcastContact[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(contactsRef, where("tenantId", "==", tenantId));

  return onQuerySnapshotWithRetry(
    q,
    (snapshot) => {
      const contacts = snapshot.docs.map(
        (docSnap) =>
          ({ id: docSnap.id, ...docSnap.data({ serverTimestamps: "estimate" }) }) as BroadcastContact
      );
      contacts.sort((a, b) => (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0));
      onData(contacts);
    },
    onError
  );
}

export async function markBroadcastContactSent(id: string): Promise<void> {
  await updateDoc(doc(db, BROADCAST_CONTACTS_COLLECTION, id), { sentAt: serverTimestamp() });
}

export async function deleteBroadcastContact(id: string): Promise<void> {
  await deleteDoc(doc(db, BROADCAST_CONTACTS_COLLECTION, id));
}
