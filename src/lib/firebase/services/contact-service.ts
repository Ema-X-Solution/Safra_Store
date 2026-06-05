import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "../config";
import type { ContactMessage } from "@/lib/types";

const COLLECTION = "messages";

export async function getContactMessages(): Promise<ContactMessage[]> {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), COLLECTION), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContactMessage));
}

export async function createContactMessage(data: Omit<ContactMessage, "id" | "read" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COLLECTION), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function markContactMessageRead(id: string) {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), { read: true });
}

export async function deleteContactMessage(id: string) {
  await deleteDoc(doc(getFirebaseDb(), COLLECTION, id));
}
