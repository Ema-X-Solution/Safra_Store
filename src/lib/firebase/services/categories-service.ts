import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseDb } from "../config";
import type { Category, CategoryInput } from "@/lib/types";

const COLLECTION = "categories";

export async function getCategories(): Promise<Category[]> {
  try {
    const snap = await getDocs(collection(getFirebaseDb(), COLLECTION));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Category))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const snap = await getDoc(doc(getFirebaseDb(), COLLECTION, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Category;
  } catch (error) {
    console.error(`Failed to fetch category ${id}:`, error);
    return null;
  }
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
  const db = getFirebaseDb();
  const batch = writeBatch(db);

  // Add category deletion to batch
  batch.delete(doc(db, COLLECTION, id));

  // Find all products in this category and add their deletion to batch
  const q = query(collection(db, "products"), where("categoryId", "==", id));
  const snap = await getDocs(q);
  snap.forEach((productDoc) => {
    batch.delete(productDoc.ref);
  });

  // Find all subcategories in this category and add their deletion to batch
  const subQ = query(collection(db, "subcategories"), where("categoryId", "==", id));
  const subSnap = await getDocs(subQ);
  subSnap.forEach((subDoc) => {
    batch.delete(subDoc.ref);
  });

  await batch.commit();
}
