import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "./config";
import type { Product, ProductInput, Order, OrderStatus } from "@/lib/types";

const PRODUCTS = "products";
const ORDERS = "orders";
const ADMINS = "admins";
const CATEGORIES = "categories";
const NOTIFICATIONS = "notifications";

export async function checkIsAdmin(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(getFirebaseDb(), ADMINS, uid));
    return snap.exists();
  } catch {
    return false;
  }
}

export async function ensureAdminRecord(uid: string, email: string) {
  await setDoc(
    doc(getFirebaseDb(), ADMINS, uid),
    { email, createdAt: serverTimestamp() },
    { merge: true }
  );
}

export async function createProduct(data: ProductInput): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), PRODUCTS), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProduct(id: string, data: Partial<ProductInput>) {
  await updateDoc(doc(getFirebaseDb(), PRODUCTS, id), data);
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(getFirebaseDb(), PRODUCTS, id));
}

export async function getAllOrders(): Promise<Order[]> {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), ORDERS), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await updateDoc(doc(getFirebaseDb(), ORDERS, orderId), { status });
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  const snap = await getDocs(collection(getFirebaseDb(), PRODUCTS));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

// Categories
export async function getAllCategories(): Promise<import("@/lib/types").Category[]> {
  const snap = await getDocs(collection(getFirebaseDb(), CATEGORIES));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as import("@/lib/types").Category))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function createCategory(data: {
  name: Record<string, string>;
  slug: string;
  order: number;
}) {
  const ref = await addDoc(collection(getFirebaseDb(), CATEGORIES), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteCategory(id: string) {
  await deleteDoc(doc(getFirebaseDb(), CATEGORIES, id));
}

// Notifications
export async function markNotificationRead(id: string) {
  await updateDoc(doc(getFirebaseDb(), NOTIFICATIONS, id), { read: true });
}

export async function markAllNotificationsRead() {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), NOTIFICATIONS), where("read", "==", false))
  );
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
}
