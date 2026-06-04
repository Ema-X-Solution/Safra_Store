"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Price from "@/components/ui/Price";
import { getOrderById, updateOrderStatus } from "@/lib/firebase/services/orders-service";
import type { Order, OrderStatus } from "@/lib/types";
import { formatFirebaseDateTime, formatFirebaseDate } from "@/lib/types";
import { toast } from "sonner";
import { useLocale } from "next-intl";

export default function AdminOrderDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = use(params);
  const locale = useLocale() as "en" | "ar";
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [note, setNote] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getOrderById(id);
        if (data) {
          setOrder(data);
          setStatus(data.status);
        }
      } catch (err) {
        toast.error("Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await updateOrderStatus(order.id, status, note);
      toast.success("Order status updated");
      setOrder(await getOrderById(id));
      setNote("");
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-40 items-center justify-center">Loading...</div>;
  if (!order) return <div className="p-8 text-center text-safra-muted">Order not found</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="rounded-lg p-2 hover:bg-white text-safra-muted hover:text-safra-dark transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-safra-dark">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-safra-muted">{formatFirebaseDateTime(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Column */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Order Items */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-safra-taupe/30 px-6 py-4">
              <h3 className="font-semibold text-safra-dark">Order Items</h3>
            </div>
            <div className="divide-y divide-safra-taupe/20">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-safra-cream">
                    <Image src={item.image || "/placeholder.jpg"} alt={item.name[locale]} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-safra-dark">{item.name[locale]}</p>
                    <p className="text-sm text-safra-muted">
                      <Price amount={item.discountPrice || item.price} /> x {item.quantity}
                    </p>
                  </div>
                  <div className="text-end font-medium text-safra-dark">
                    <Price amount={(item.discountPrice || item.price) * item.quantity} />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-safra-cream/30 p-6">
              <div className="space-y-2 text-sm text-safra-dark">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <Price amount={order.subtotal} />
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <Price amount={order.shippingFee || 0} />
                </div>
                {order.discount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-<Price amount={order.discount} /></span>
                  </div>
                )}
                <div className="pt-2 border-t border-safra-taupe/30 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <Price amount={order.total} />
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-safra-taupe/30 px-6 py-4">
              <h3 className="font-semibold text-safra-dark">Status History</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-safra-taupe/40">
                {(order.statusHistory || []).map((entry, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-safra-gold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow"></div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-safra-taupe/40 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-safra-dark uppercase text-xs">{entry.status}</h4>
                        <time className="text-xs text-safra-muted">{formatFirebaseDateTime(entry.timestamp)}</time>
                      </div>
                      {entry.note && <p className="text-sm text-safra-muted mt-2">{entry.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Status Update */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white shadow-sm overflow-hidden p-6 space-y-4">
            <h3 className="font-semibold text-safra-dark">Update Status</h3>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as OrderStatus)}
              className="w-full rounded-lg border border-safra-taupe/40 p-2 text-sm focus:border-safra-gold focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <textarea
              placeholder="Add an internal note (optional)..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full rounded-lg border border-safra-taupe/40 p-2 text-sm focus:border-safra-gold focus:outline-none custom-scrollbar"
              rows={3}
            />
            <Button onClick={handleUpdateStatus} loading={saving} className="w-full gap-2">
              <Save className="h-4 w-4" />
              Update Order
            </Button>
          </div>

          {/* Customer Info */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-safra-taupe/30 px-6 py-4">
              <h3 className="font-semibold text-safra-dark">Customer Info</h3>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div>
                <p className="text-safra-muted text-xs font-semibold uppercase mb-1">Name</p>
                <p className="text-safra-dark font-medium">{order.shippingAddress?.fullName}</p>
              </div>
              <div>
                <p className="text-safra-muted text-xs font-semibold uppercase mb-1">Contact</p>
                <p className="text-safra-dark">{order.shippingAddress?.email || order.userId}</p>
                <p className="text-safra-dark">{order.shippingAddress?.phone}</p>
              </div>
              <div>
                <p className="text-safra-muted text-xs font-semibold uppercase mb-1">Shipping Address</p>
                <p className="text-safra-dark">{order.shippingAddress?.address}</p>
                <p className="text-safra-dark">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
              </div>
              {order.notes && (
                <div>
                  <p className="text-safra-muted text-xs font-semibold uppercase mb-1">Order Notes</p>
                  <p className="text-safra-dark bg-safra-light/30 p-2 rounded-lg">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
