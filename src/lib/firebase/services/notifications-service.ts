import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { getFirebaseDb } from "../config";
import type { AdminNotification } from "@/lib/types";

const COLLECTION = "notifications";

export function subscribeToNotifications(callback: (notifications: AdminNotification[]) => void) {
  const q = query(collection(getFirebaseDb(), COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminNotification)));
  });
}

export async function markNotificationRead(id: string) {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), { read: true });
}

export async function markAllNotificationsRead() {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), COLLECTION), where("read", "==", false))
  );
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
}
