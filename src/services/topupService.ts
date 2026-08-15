import { collection, getDocs, limit, orderBy, query, Timestamp, where } from "firebase/firestore";
import { db } from "../firebase";
import type { Topup } from "../types/topup";

const TOPUPS_COLLECTION = "topups";
const topupsRef = collection(db, TOPUPS_COLLECTION);

/** One-time fetch (not realtime) — analytics periods are picked, not streamed. */
export async function getTopupsInRange(start: Date, end: Date): Promise<Topup[]> {
  const q = query(
    topupsRef,
    where("createdAt", ">=", Timestamp.fromDate(start)),
    where("createdAt", "<=", Timestamp.fromDate(end)),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as Topup[];
}

export async function getRecentTopups(count: number): Promise<Topup[]> {
  const q = query(topupsRef, orderBy("createdAt", "desc"), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as Topup[];
}
