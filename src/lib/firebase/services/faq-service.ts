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
import type { FAQ, FAQInput } from "@/lib/types";

const COLLECTION = "faqs";

export async function getFAQs(): Promise<FAQ[]> {
  try {
    const snap = await getDocs(query(collection(getFirebaseDb(), COLLECTION), orderBy("order", "asc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FAQ));
  } catch (error) {
    console.error("Failed to fetch FAQs:", error);
    return [];
  }
}

export async function createFAQ(data: FAQInput): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateFAQ(id: string, data: Partial<FAQInput>) {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), data);
}

export async function deleteFAQ(id: string) {
  await deleteDoc(doc(getFirebaseDb(), COLLECTION, id));
}
