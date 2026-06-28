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
  serverTimestamp,
  deleteField,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "../config";
import type { Product, ProductInput } from "@/lib/types";

const COLLECTION = "products";

function convertFirestoreTimestamps<T extends Record<string, unknown>>(data: T): T {
  if (!data) return data;
  
  const result: Record<string, unknown> = { ...data };
  
  if (result.createdAt && result.createdAt instanceof Timestamp) {
    result.createdAt = {
      seconds: result.createdAt.seconds,
      nanoseconds: result.createdAt.nanoseconds,
    };
  }
  
  if (result.updatedAt && result.updatedAt instanceof Timestamp) {
    result.updatedAt = {
      seconds: result.updatedAt.seconds,
      nanoseconds: result.updatedAt.nanoseconds,
    };
  }
  
  return result as T;
}

/** For CREATE: skip null and undefined values entirely (deleteField is not valid in addDoc) */
function cleanForCreate<T extends object>(obj: T): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && v !== undefined) {
      result[k] = v;
    }
  }
  return result as Partial<T>;
}

/** For UPDATE: convert null to deleteField() so fields are removed from the document */
function cleanData<T extends object>(obj: T): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null) {
      result[k] = deleteField();
    } else if (v !== undefined) {
      result[k] = v;
    }
  }
  return result as Partial<T>;
}

export async function getProducts(): Promise<Product[]> {
  try {
    const snap = await getDocs(collection(getFirebaseDb(), COLLECTION));
    return snap.docs.map((d) => ({
      id: d.id,
      ...convertFirestoreTimestamps(d.data()),
    } as Product));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const snap = await getDoc(doc(getFirebaseDb(), COLLECTION, id));
    if (!snap.exists()) return null;
    return {
      id: snap.id,
      ...convertFirestoreTimestamps(snap.data()),
    } as Product;
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    return null;
  }
}

export async function createProduct(data: ProductInput): Promise<string> {
  try {
    const ref = await addDoc(collection(getFirebaseDb(), COLLECTION), {
      ...cleanForCreate(data),
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (error) {
    console.error("createProduct failed:", error);
    throw error;
  }
}

export async function updateProduct(id: string, data: Partial<ProductInput>) {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), {
    ...cleanData(data),
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
    return snap.docs.map((d) => ({
      id: d.id,
      ...convertFirestoreTimestamps(d.data()),
    } as Product));
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
    return snap.docs.map((d) => ({
      id: d.id,
      ...convertFirestoreTimestamps(d.data()),
    } as Product));
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
    return snap.docs.map((d) => ({
      id: d.id,
      ...convertFirestoreTimestamps(d.data()),
    } as Product));
  } catch (error) {
    console.error("Failed to fetch discounted products:", error);
    return [];
  }
}
