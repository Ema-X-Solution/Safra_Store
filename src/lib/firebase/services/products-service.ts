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
import type { Product, ProductInput } from "@/lib/types";

const COLLECTION = "products";

export async function getProducts(): Promise<Product[]> {
  try {
    const snap = await getDocs(collection(getFirebaseDb(), COLLECTION));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const snap = await getDoc(doc(getFirebaseDb(), COLLECTION, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Product;
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    return null;
  }
}

export async function createProduct(data: ProductInput): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProduct(id: string, data: Partial<ProductInput>) {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(getFirebaseDb(), COLLECTION, id));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const q = query(
      collection(getFirebaseDb(), COLLECTION),
      where("featured", "==", true)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  } catch (error) {
    console.error("Failed to fetch featured products:", error);
    return [];
  }
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    const q = query(
      collection(getFirebaseDb(), COLLECTION),
      where("categoryId", "==", categoryId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  } catch (error) {
    console.error(`Failed to fetch products for category ${categoryId}:`, error);
    return [];
  }
}

export async function getDiscountedProducts(): Promise<Product[]> {
  try {
    const q = query(
      collection(getFirebaseDb(), COLLECTION),
      where("discountPrice", ">", 0)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  } catch (error) {
    console.error("Failed to fetch discounted products:", error);
    return [];
  }
}
