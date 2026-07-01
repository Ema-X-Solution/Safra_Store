import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "./config";
import type { Product, Order, CartItem, ShippingAddress, Category } from "@/lib/types";
import { toDate } from "@/lib/types";

const PRODUCTS = "products";
const ORDERS = "orders";
const CATEGORIES = "categories";
const NOTIFICATIONS = "notifications";

async function safeRead<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("Firestore read failed:", err);
    return fallback;
  }
}

export async function getCategories(): Promise<Category[]> {
  return safeRead(async () => {
    const snap = await getDocs(collection(getFirebaseDb(), CATEGORIES));
    return snap.docs
      .map((d) => {
        const data = d.data();
        return { 
          id: d.id, 
          ...data, 
          createdAt: data.createdAt ? toDate(data.createdAt) : undefined 
        } as Category;
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, []);
}

export async function getProducts(): Promise<Product[]> {
  return safeRead(async () => {
    const snap = await getDocs(collection(getFirebaseDb(), PRODUCTS));
    return snap.docs.map((d) => {
      const data = d.data();
      return { 
        id: d.id, 
        ...data, 
        createdAt: data.createdAt ? toDate(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? toDate(data.updatedAt) : undefined
      } as Product;
    }).filter(p => p.status !== "inactive");
  }, []);
}

export async function getProductById(id: string): Promise<Product | null> {
  return safeRead(async () => {
    const snap = await getDoc(doc(getFirebaseDb(), PRODUCTS, id));
    if (!snap.exists()) return null;
    const data = snap.data();
    const product = { 
      id: snap.id, 
      ...data, 
      createdAt: data.createdAt ? toDate(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? toDate(data.updatedAt) : undefined
    } as Product;
    return product.status !== "inactive" ? product : null;
  }, null);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return safeRead(async () => {
    const q = query(collection(getFirebaseDb(), PRODUCTS), where("featured", "==", true));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return { 
        id: d.id, 
        ...data, 
        createdAt: data.createdAt ? toDate(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? toDate(data.updatedAt) : undefined
      } as Product;
    }).filter(p => p.status !== "inactive");
  }, []);
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  return safeRead(async () => {
    const q = query(collection(getFirebaseDb(), PRODUCTS), where("categoryId", "==", categoryId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return { 
        id: d.id, 
        ...data, 
        createdAt: data.createdAt ? toDate(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? toDate(data.updatedAt) : undefined
      } as Product;
    }).filter(p => p.status !== "inactive");
  }, []);
}

export async function createOrder(
  userId: string,
  items: CartItem[],
  total: number,
  shippingAddress: ShippingAddress
): Promise<string> {
  const db = getFirebaseDb();
  const docRef = await addDoc(collection(db, ORDERS), {
    userId,
    items: items.map(({ product, quantity }) => ({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    })),
    total,
    status: "pending",
    shippingAddress,
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(db, NOTIFICATIONS), {
    type: "new_order",
    orderId: docRef.id,
    total,
    customerName: shippingAddress.fullName,
    read: false,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const q = query(
    collection(getFirebaseDb(), ORDERS),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}
