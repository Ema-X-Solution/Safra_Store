import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "../config";
import type { Order, OrderStatus, OrderStatusHistoryEntry } from "@/lib/types";

const COLLECTION = "orders";

export async function getAllOrders(): Promise<Order[]> {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), COLLECTION), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

export async function getOrderById(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(getFirebaseDb(), COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found");

  const newHistoryEntry: OrderStatusHistoryEntry = {
    status,
    timestamp: new Date() as any, // Will be serialized properly or use serverTimestamp if updating complex objects
    note,
  };

  const history = order.statusHistory || [];

  await updateDoc(doc(getFirebaseDb(), COLLECTION, orderId), {
    status,
    statusHistory: [...history, newHistoryEntry],
    updatedAt: serverTimestamp(),
  });
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const q = query(
    collection(getFirebaseDb(), COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

export async function createOrder(data: Omit<Order, "id" | "createdAt" | "statusHistory">): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COLLECTION), {
    ...data,
    statusHistory: [
      {
        status: data.status,
        timestamp: new Date(),
        note: "Order placed",
      },
    ],
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
