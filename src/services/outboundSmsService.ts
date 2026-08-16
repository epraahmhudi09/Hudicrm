import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import type { OutboundSms } from "../types/outboundSms";

const OUTBOUND_SMS_COLLECTION = "outboundSms";

/**
 * Most recent reminder(s) queued/sent for a given customer, newest first.
 * Sorted client-side (rather than orderBy in the query) to avoid needing a
 * composite index — an equality filter alone only needs the automatic
 * single-field index.
 */
export async function getOutboundSmsForCustomer(
  tenantId: string,
  customerId: string,
  count = 5
): Promise<OutboundSms[]> {
  // Both filters are required: tenantId because Firestore's security rules
  // for list queries must be able to prove every match satisfies them from
  // the query's own filters (not by testing each returned document), and
  // customerId is the actual selectivity we want.
  const q = query(
    collection(db, OUTBOUND_SMS_COLLECTION),
    where("tenantId", "==", tenantId),
    where("customerId", "==", customerId)
  );
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as OutboundSms
  );
  results.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
  return results.slice(0, count);
}
