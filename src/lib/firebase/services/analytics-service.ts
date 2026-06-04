import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getFirebaseDb } from "../config";
import type { Order, Product } from "@/lib/types";

export interface DashboardStats {
  productsCount: number;
  categoriesCount: number;
  ordersCount: number;
  pendingOrdersCount: number;
  completedOrdersCount: number;
  customersCount: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = getFirebaseDb();
  
  // This is a naive implementation that pulls all documents.
  // In a production app with large datasets, use Cloud Functions or aggregation queries.
  const [productsSnap, categoriesSnap, ordersSnap] = await Promise.all([
    getDocs(collection(db, "products")),
    getDocs(collection(db, "categories")),
    getDocs(collection(db, "orders")),
  ]);

  let pendingOrdersCount = 0;
  let completedOrdersCount = 0;
  let totalRevenue = 0;
  let monthlyRevenue = 0;
  
  const customerSet = new Set();
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  ordersSnap.docs.forEach((doc) => {
    const order = doc.data() as Order;
    
    if (order.status === "pending") pendingOrdersCount++;
    if (order.status === "delivered") completedOrdersCount++;
    if (order.status !== "cancelled") {
      totalRevenue += order.total;
      
      const orderDate = "seconds" in order.createdAt 
        ? new Date(order.createdAt.seconds * 1000) 
        : new Date(order.createdAt as unknown as string);
        
      if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
        monthlyRevenue += order.total;
      }
    }
    
    const customerId = order.shippingAddress?.email || order.userId;
    if (customerId) customerSet.add(customerId);
  });

  return {
    productsCount: productsSnap.size,
    categoriesCount: categoriesSnap.size,
    ordersCount: ordersSnap.size,
    pendingOrdersCount,
    completedOrdersCount,
    customersCount: customerSet.size,
    totalRevenue,
    monthlyRevenue,
  };
}
