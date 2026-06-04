import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "../config";
import type { Category, CategoryInput } from "@/lib/types";

const COLLECTION = "categories";

export async function getCategories(): Promise<Category[]> {
  const snap = await getDocs(collection(getFirebaseDb(), COLLECTION));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Category))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const snap = await getDoc(doc(getFirebaseDb(), COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Category;
}

export async function createCategory(data: CategoryInput): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCategory(id: string, data: Partial<CategoryInput>) {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), data);
}

export async function deleteCategory(id: string) {
  // Optionally: Delete related products here, or rely on a Cloud Function / UI confirmation
  await deleteDoc(doc(getFirebaseDb(), COLLECTION, id));
}
