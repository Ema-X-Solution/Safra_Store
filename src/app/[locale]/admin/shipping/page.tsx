"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getShippingInfo, updateShippingInfo } from "@/lib/firebase/services/shipping-service";
import type { ShippingInfo } from "@/lib/types";
import { toast } from "sonner";

export default function AdminShippingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [fee, setFee] = useState(0);
  const [policyEn, setPolicyEn] = useState("");
  const [policyAr, setPolicyAr] = useState("");
  const [timesEn, setTimesEn] = useState("");
  const [timesAr, setTimesAr] = useState("");
  const [areasEn, setAreasEn] = useState("");
  const [areasAr, setAreasAr] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const info = await getShippingInfo();
        if (info) {
          setFee(info.shippingFee || 0);
          setPolicyEn(info.policy?.en || "");
          setPolicyAr(info.policy?.ar || "");
          setTimesEn(info.deliveryTimes?.en || "");
          setTimesAr(info.deliveryTimes?.ar || "");
          setAreasEn(info.deliveryAreas?.en || "");
          setAreasAr(info.deliveryAreas?.ar || "");
        }
      } catch (err) {
        toast.error("Failed to load shipping info");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateShippingInfo({
        shippingFee: Number(fee),
        policy: { en: policyEn, ar: policyAr },
        deliveryTimes: { en: timesEn, ar: timesAr },
        deliveryAreas: { en: areasEn, ar: areasAr },
      });
      toast.success("Shipping info updated");
    } catch (err) {
      toast.error("Failed to save shipping info");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-40 items-center justify-center text-safra-muted">Loading...</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-safra-dark">Shipping Settings</h1>
        <p className="mt-1 text-sm text-safra-muted">Manage shipping policies, fees, and areas.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm">
          <Input name="fee" label="Default Shipping Fee" type="number" step="0.01" value={fee} onChange={e => setFee(Number(e.target.value))} required />
        </div>

        <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6">
          <h3 className="font-semibold text-safra-dark">Shipping Policy</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">English</label>
              <textarea value={policyEn} onChange={e => setPolicyEn(e.target.value)} rows={4} className="w-full rounded-lg border border-safra-taupe/40 p-2" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Arabic</label>
              <textarea value={policyAr} onChange={e => setPolicyAr(e.target.value)} rows={4} dir="rtl" className="w-full rounded-lg border border-safra-taupe/40 p-2" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6">
          <h3 className="font-semibold text-safra-dark">Delivery Times</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">English</label>
              <textarea value={timesEn} onChange={e => setTimesEn(e.target.value)} rows={3} className="w-full rounded-lg border border-safra-taupe/40 p-2" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Arabic</label>
              <textarea value={timesAr} onChange={e => setTimesAr(e.target.value)} rows={3} dir="rtl" className="w-full rounded-lg border border-safra-taupe/40 p-2" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6">
          <h3 className="font-semibold text-safra-dark">Delivery Areas</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">English</label>
              <textarea value={areasEn} onChange={e => setAreasEn(e.target.value)} rows={3} className="w-full rounded-lg border border-safra-taupe/40 p-2" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Arabic</label>
              <textarea value={areasAr} onChange={e => setAreasAr(e.target.value)} rows={3} dir="rtl" className="w-full rounded-lg border border-safra-taupe/40 p-2" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={saving} className="gap-2">
            <Save className="h-4 w-4" />
            Save Shipping Info
          </Button>
        </div>
      </form>
    </div>
  );
}
