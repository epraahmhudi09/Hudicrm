import { collection, getDocs, query, Timestamp, where } from "firebase/firestore";
import { db } from "../firebase";
import type { Topup } from "../types/topup";

const TOPUPS_COLLECTION = "topups";
const topupsRef = collection(db, TOPUPS_COLLECTION);

function sortByCreatedAtDesc(topups: Topup[]): Topup[] {
  return [...topups].sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
}

/**
 * One-time fetch (not realtime) — analytics periods are picked, not streamed.
 * Filters/sorts client-side rather than via a compound Firestore query
 * (tenantId equality + a date range + orderBy would need a composite index,
 * which isn't provisionable here) — fine at this data scale.
 */
export async function getTopupsInRange(tenantId: string, start: Date, end: Date): Promise<Topup[]> {
  const q = query(topupsRef, where("tenantId", "==", tenantId));
  const snapshot = await getDocs(q);
  const topups = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as Topup[];
  const startMs = Timestamp.fromDate(start).toMillis();
  const endMs = Timestamp.fromDate(end).toMillis();
  return sortByCreatedAtDesc(
    topups.filter((t) => {
      const ms = t.createdAt?.toMillis() ?? 0;
      return ms >= startMs && ms <= endMs;
    })
  );
}

export async function getRecentTopups(tenantId: string, count: number): Promise<Topup[]> {
  const q = query(topupsRef, where("tenantId", "==", tenantId));
  const snapshot = await getDocs(q);
  const topups = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as Topup[];
  return sortByCreatedAtDesc(topups).slice(0, count);
}
