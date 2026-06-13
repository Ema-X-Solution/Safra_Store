import {
  collection,
  doc,
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
  // Send realtime notification to admin dashboard
  try {
    const { createNotification } = await import("./notifications-service");
    await createNotification({
      type: "new_message",
      customerName: data.name,
      message: data.subject,
    });
  } catch (e) {
    console.error("Failed to create notification:", e);
  }
  return ref.id;
}

export async function markContactMessageRead(id: string) {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), { read: true });
}

export async function deleteContactMessage(id: string) {
  await deleteDoc(doc(getFirebaseDb(), COLLECTION, id));
}
