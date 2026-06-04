import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { getFirebaseDb } from "../config";
import type { Customer, Order } from "@/lib/types";

const ORDERS_COLLECTION = "orders";

export async function getCustomers(): Promise<Customer[]> {
  // Aggregate customers from orders
  const snap = await getDocs(
    query(collection(getFirebaseDb(), ORDERS_COLLECTION), orderBy("createdAt", "desc"))
  );
  
  const customerMap = new Map<string, Customer>();

  snap.docs.forEach((doc) => {
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
