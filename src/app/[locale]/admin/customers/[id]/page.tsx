"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, User, Mail, Phone, ShoppingBag, DollarSign, Calendar } from "lucide-react";
import { Link } from "@/i18n/navigation";
import OrdersTable from "@/components/admin/orders/OrdersTable";
import { getUserOrders } from "@/lib/firebase/services/orders-service";
import type { Order, Customer } from "@/lib/types";
import { formatFirebaseDate } from "@/lib/types";
import Price from "@/components/ui/Price";
import { toast } from "sonner";

export default function AdminCustomerDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = use(params);
  const email = decodeURIComponent(id); // Using email as customer ID

  const [orders, setOrders] = useState<Order[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Find orders by user email (stored in shippingAddress or userId)
        // In a real setup, we'd query by customerId/userId explicitly.
        // For now, we simulate finding the customer details from orders.
        const allOrders = await getUserOrders(email); 
        // Note: getUserOrders might just use userId. If guest checkout, this might not work perfectly without adjusting the query.
        
        // Let's just fetch all orders and filter locally to be safe for this demo
        const { getAllOrders } = await import("@/lib/firebase/services/orders-service");
        const all = await getAllOrders();
        const userOrders = all.filter(o => o.shippingAddress?.email === email || o.userId === email);
        
        setOrders(userOrders);

        if (userOrders.length > 0) {
          const totalSpent = userOrders.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.total : 0), 0);
          const firstOrder = userOrders[userOrders.length - 1]; // Assuming desc sort
          
          setCustomer({
            id: email,
            name: userOrders[0].shippingAddress?.fullName || "Unknown",
            email: email,
            phone: userOrders[0].shippingAddress?.phone || "",
            ordersCount: userOrders.length,
            totalSpending: totalSpent,
            lastOrderDate: userOrders[0].createdAt,
            createdAt: firstOrder.createdAt,
          });
        }
      } catch (err) {
        toast.error("Failed to load customer details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [email]);

  if (loading) return <div className="flex h-40 items-center justify-center">Loading...</div>;
  if (!customer) return <div className="p-8 text-center text-safra-muted">Customer not found</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" className="rounded-lg p-2 hover:bg-white text-safra-muted hover:text-safra-dark transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-safra-dark">{customer.name}</h1>
          <p className="text-sm text-safra-muted">Customer Profile</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6 md:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-safra-gold/20 text-2xl font-bold text-safra-deep-gold mb-4">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-safra-dark">{customer.name}</h2>
            <p className="text-safra-muted">Customer since {formatFirebaseDate(customer.createdAt)}</p>
          </div>

          <div className="space-y-3 pt-6 border-t border-safra-taupe/30">
            <div className="flex items-center gap-3 text-sm text-safra-dark">
              <Mail className="h-4 w-4 text-safra-olive" />
              <a href={`mailto:${customer.email}`} className="hover:text-safra-gold">{customer.email}</a>
            </div>
            <div className="flex items-center gap-3 text-sm text-safra-dark">
              <Phone className="h-4 w-4 text-safra-olive" />
              <a href={`tel:${customer.phone}`} className="hover:text-safra-gold">{customer.phone}</a>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 md:col-span-2">
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-safra-light/30">
              <DollarSign className="h-6 w-6 text-safra-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-safra-muted">Total Spent</p>
              <p className="text-2xl font-bold text-safra-dark"><Price amount={customer.totalSpending} /></p>
            </div>
          </div>
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-safra-light/30">
              <ShoppingBag className="h-6 w-6 text-safra-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-safra-muted">Total Orders</p>
              <p className="text-2xl font-bold text-safra-dark">{customer.ordersCount}</p>
            </div>
          </div>
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm flex items-center gap-4 sm:col-span-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-safra-light/30">
              <Calendar className="h-6 w-6 text-safra-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-safra-muted">Last Order</p>
              <p className="text-lg font-bold text-safra-dark">{formatFirebaseDate(customer.lastOrderDate)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <h2 className="mb-4 text-xl font-bold text-safra-dark">Order History</h2>
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}
