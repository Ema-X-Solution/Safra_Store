import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "../config";
import type { Customer, Order } from "@/lib/types";

const ORDERS_COLLECTION = "orders";
const CUSTOMERS_COLLECTION = "customers";

export async function getCustomers(): Promise<Customer[]> {
  const db = getFirebaseDb();
  
  // 1. Fetch manually created customers
  const manualCustomersSnap = await getDocs(
    query(collection(db, CUSTOMERS_COLLECTION), orderBy("createdAt", "desc"))
  );
  
  const customerMap = new Map<string, Customer>();

  manualCustomersSnap.docs.forEach((doc) => {
    const data = doc.data();
    customerMap.set(data.email || doc.id, {
      id: doc.id,
      name: data.name || "Unknown",
      email: data.email || "",
      phone: data.phone || "",
      ordersCount: 0,
      totalSpending: 0,
      lastOrderDate: data.createdAt,
      createdAt: data.createdAt,
    });
  });

  // 2. Aggregate customers from orders
  const ordersSnap = await getDocs(
    query(collection(db, ORDERS_COLLECTION), orderBy("createdAt", "desc"))
  );

  ordersSnap.docs.forEach((doc) => {
    const order = { id: doc.id, ...doc.data() } as Order;
    const email = order.shippingAddress?.email || order.userId;
    
    if (!customerMap.has(email)) {
      customerMap.set(email, {
        id: email, // use email or userId as ID
        name: order.shippingAddress?.fullName || "Unknown",
        email: email,
        phone: order.shippingAddress?.phone || "",
        ordersCount: 1,
        totalSpending: order.total,
        lastOrderDate: order.createdAt,
        createdAt: order.createdAt, // approximation
      });
    } else {
      const existing = customerMap.get(email)!;
      existing.ordersCount++;
      existing.totalSpending += order.total;
      // keep the newest order date (assuming query is desc)
      if (order.createdAt > existing.lastOrderDate) {
         existing.lastOrderDate = order.createdAt;
      }
    }
  });

  return Array.from(customerMap.values());
}

export async function createCustomer(data: { name: string; email: string; phone: string }): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), CUSTOMERS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
