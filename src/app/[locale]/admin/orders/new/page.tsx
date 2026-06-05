"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Plus, Minus, Trash2, ArrowLeft, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Price from "@/components/ui/Price";
import { getProducts } from "@/lib/firebase/services/products-service";
import { createOrder } from "@/lib/firebase/services/orders-service";
import { getShippingInfo } from "@/lib/firebase/services/shipping-service";
import type { Product, OrderItem, OrderStatus, PaymentStatus, PaymentMethod, ShippingZone } from "@/lib/types";
import { toast } from "sonner";
import { useLocale } from "next-intl";

export default function AddOrderPage() {
  const router = useRouter();
  const locale = useLocale() as "en" | "ar";

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [defaultFee, setDefaultFee] = useState(0);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);

  const [selectedZone, setSelectedZone] = useState<string>("");
  const [shippingFee, setShippingFee] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [prods, shippingInfo] = await Promise.all([
          getProducts(),
          getShippingInfo(),
        ]);
        setProducts(prods);
        if (shippingInfo) {
          const z = shippingInfo.shippingZones || [];
          setZones(z);
          setDefaultFee(shippingInfo.shippingFee || 0);
          // Auto-select first zone if available
          if (z.length > 0) {
            setSelectedZone(z[0].name.en);
            setShippingFee(z[0].fee);
          } else {
            setShippingFee(shippingInfo.shippingFee || 0);
          }
        }
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoadingProducts(false);
      }
    }
    load();
  }, []);

  const handleZoneChange = (zoneKey: string) => {
    setSelectedZone(zoneKey);
    if (zoneKey === "__default__") {
      setShippingFee(defaultFee);
    } else {
      const zone = zones.find(z => z.name.en === zoneKey);
      setShippingFee(zone ? zone.fee : defaultFee);
    }
  };

  const handleAddProduct = () => {
    if (!selectedProduct) return;
    const prod = products.find((p) => p.id === selectedProduct);
    if (!prod) return;

    if (items.some((i) => i.productId === prod.id)) {
      toast.error("Product already added to order");
      return;
    }

    setItems([...items, {
      productId: prod.id,
      name: prod.name,
      price: prod.price,
      discountPrice: prod.discountPrice,
      image: prod.images?.[0] || prod.image,
      quantity: 1,
    }]);
    setSelectedProduct("");
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.productId === id) return { ...item, quantity: Math.max(1, item.quantity + delta) };
      return item;
    }));
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(item => item.productId !== id));

  const subtotal = items.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0);
  const total = Math.max(0, subtotal + shippingFee - discount);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Add at least one product to the order");
      return;
    }

    setSaving(true);
    const form = new FormData(e.currentTarget);
    const shippingAddress = {
      fullName: form.get("fullName") as string,
      address: form.get("address") as string,
      city: selectedZone !== "__default__" ? selectedZone : (form.get("city") as string),
      postalCode: form.get("postalCode") as string,
      phone: form.get("phone") as string,
      email: form.get("email") as string,
    };

    try {
      await createOrder({
        userId: "admin-created",
        items,
        subtotal,
        shippingFee,
        discount,
        total,
        status,
        paymentStatus,
        paymentMethod,
        shippingAddress,
        notes,
      });
      toast.success("Order created successfully");
      router.push("/admin/orders");
    } catch (err) {
      toast.error("Failed to create order");
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="rounded-lg p-2 text-safra-muted hover:bg-white hover:text-safra-dark transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-safra-dark">Create Manual Order</h1>
          <p className="mt-1 text-sm text-safra-muted">Place an order directly from the dashboard.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Left Col */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products Box */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-safra-dark">Order Items</h2>
            <div className="flex gap-2">
              <select
                value={selectedProduct}
                onChange={e => setSelectedProduct(e.target.value)}
                disabled={loadingProducts}
                className="flex-1 rounded-lg border border-safra-taupe/40 bg-white px-4 py-2 focus:outline-none focus:ring-1 focus:ring-safra-gold"
              >
                <option value="">{loadingProducts ? "Loading products..." : "Select a product to add..."}</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name[locale]} — {p.price}</option>
                ))}
              </select>
              <Button type="button" onClick={handleAddProduct} disabled={!selectedProduct}>Add</Button>
            </div>

            {items.length > 0 ? (
              <div className="space-y-3 mt-4">
                {items.map(item => (
                  <div key={item.productId} className="flex items-center justify-between gap-4 rounded-lg border border-safra-taupe/20 p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-safra-dark truncate">{item.name[locale]}</p>
                      <p className="text-sm text-safra-muted"><Price amount={item.discountPrice || item.price} /></p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 rounded-lg border border-safra-taupe/30 px-2 py-1">
                        <button type="button" onClick={() => updateQuantity(item.productId, -1)} className="p-1 text-safra-muted hover:text-safra-dark">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.productId, 1)} className="p-1 text-safra-muted hover:text-safra-dark">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button type="button" onClick={() => removeItem(item.productId)} className="p-2 text-red-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-safra-cream/30 p-6 text-center text-safra-muted border border-dashed border-safra-taupe/40">
                No products added yet.
              </div>
            )}
          </div>

          {/* Customer Info Box */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-safra-dark">Customer Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="fullName" label="Full Name" required />
              <Input name="phone" label="Phone Number" required />
              <Input name="email" type="email" label="Email Address (Optional)" />
              <div className="space-y-1">
                <label className="text-sm font-medium text-safra-dark">City / Area</label>
                {zones.length > 0 ? (
                  <select
                    value={selectedZone}
                    onChange={e => handleZoneChange(e.target.value)}
                    className="w-full rounded-lg border border-safra-taupe/40 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-safra-gold"
                  >
                    {zones.map(z => (
                      <option key={z.name.en} value={z.name.en}>
                        {z.name.en} / {z.name.ar}
                      </option>
                    ))}
                    <option value="__default__">Other (Default Fee)</option>
                  </select>
                ) : (
                  <Input name="city" label="" required />
                )}
              </div>
              <div className="sm:col-span-2">
                <Input name="address" label="Full Address" required />
              </div>
              <Input name="postalCode" label="Postal Code (Optional)" />
            </div>
          </div>
        </div>

        {/* Right Col: Summary & Settings */}
        <div className="space-y-6">
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-safra-dark">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-safra-muted">
                <span>Subtotal</span>
                <span><Price amount={subtotal} /></span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-safra-muted">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Shipping {selectedZone && selectedZone !== "__default__" ? `(${selectedZone})` : ""}</span>
                </div>
                <span className="font-medium text-safra-dark"><Price amount={shippingFee} /></span>
              </div>
              <div className="flex justify-between items-center text-safra-muted">
                <span>Discount</span>
                <input
                  type="number"
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value))}
                  className="w-20 rounded border border-safra-taupe/40 px-2 py-1 text-right text-safra-dark"
                />
              </div>
              <div className="pt-2 border-t border-safra-taupe/20 flex justify-between font-bold text-safra-dark text-lg">
                <span>Total</span>
                <span><Price amount={total} /></span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-safra-dark">Settings</h2>

            <div className="space-y-1">
              <label className="text-sm font-medium text-safra-dark">Order Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as OrderStatus)}
                className="w-full rounded-lg border border-safra-taupe/40 bg-white px-3 py-2 text-sm focus:ring-1 focus:ring-safra-gold">
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-safra-dark">Payment Method</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-lg border border-safra-taupe/40 bg-white px-3 py-2 text-sm focus:ring-1 focus:ring-safra-gold">
                <option value="cod">Cash on Delivery (COD)</option>
                <option value="card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-safra-dark">Payment Status</label>
              <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full rounded-lg border border-safra-taupe/40 bg-white px-3 py-2 text-sm focus:ring-1 focus:ring-safra-gold">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-safra-dark">Notes (Optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                className="w-full rounded-lg border border-safra-taupe/40 bg-white px-3 py-2 text-sm focus:ring-1 focus:ring-safra-gold" />
            </div>

            <Button type="submit" loading={saving} className="w-full mt-4">
              Create Order
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
