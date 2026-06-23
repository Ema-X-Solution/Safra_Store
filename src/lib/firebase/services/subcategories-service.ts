import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy, writeBatch } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/config";
import type { SubCategory, SubCategoryInput, Product } from "@/lib/types";

const COLLECTION = "subcategories";

export async function getSubCategories(categoryId: string): Promise<SubCategory[]> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, COLLECTION),
    where("categoryId", "==", categoryId)
  );
  
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SubCategory));
  return results.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getSubCategoryById(id: string): Promise<SubCategory | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as SubCategory;
}

export async function createSubCategory(data: SubCategoryInput): Promise<string> {
  const db = getFirebaseDb();
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateSubCategory(id: string, data: Partial<SubCategoryInput>): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteSubCategory(id: string): Promise<void> {
  const db = getFirebaseDb();
  
  // 1. Delete the subcategory itself
  await deleteDoc(doc(db, COLLECTION, id));

  // 2. Delete all products belonging to this subcategory (per user instruction)
  const productsQ = query(
    collection(db, "products"),
    where("subcategoryId", "==", id)
  );
  const productsSnap = await getDocs(productsQ);

  if (!productsSnap.empty) {
    const batch = writeBatch(db);
    productsSnap.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  }
}
