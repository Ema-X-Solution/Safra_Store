"use client";

import { useEffect, useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { getShippingInfo, updateShippingInfo } from "@/lib/firebase/services/shipping-service";
import type { ShippingZone } from "@/lib/types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function AdminShippingPage() {
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fee, setFee] = useState(0);
  const [policyEn, setPolicyEn] = useState("");
  const [policyAr, setPolicyAr] = useState("");
  const [timesEn, setTimesEn] = useState("");
  const [timesAr, setTimesAr] = useState("");
  const [areasEn, setAreasEn] = useState("");
  const [areasAr, setAreasAr] = useState("");
  const [zones, setZones] = useState<ShippingZone[]>([]);

  // New zone form state
  const [newZoneEn, setNewZoneEn] = useState("");
  const [newZoneAr, setNewZoneAr] = useState("");
  const [newZoneFee, setNewZoneFee] = useState<number>(0);

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
          setZones(info.shippingZones || []);
        }
      } catch (err) {
        toast.error("Failed to load shipping info");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const addZone = () => {
    if (!newZoneEn.trim() || !newZoneAr.trim()) {
      toast.error("Please enter both English and Arabic zone names");
      return;
    }
    if (zones.some(z => z.name.en.toLowerCase() === newZoneEn.trim().toLowerCase())) {
      toast.error("A zone with this English name already exists");
      return;
    }
    setZones(prev => [...prev, { name: { en: newZoneEn.trim(), ar: newZoneAr.trim() }, fee: newZoneFee }]);
    setNewZoneEn("");
    setNewZoneAr("");
    setNewZoneFee(0);
  };

  const removeZone = (index: number) => {
    setZones(prev => prev.filter((_, i) => i !== index));
  };

  const updateZoneFee = (index: number, newFee: number) => {
    setZones(prev => prev.map((z, i) => i === index ? { ...z, fee: newFee } : z));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateShippingInfo({
        shippingFee: Number(fee),
        policy: { en: policyEn, ar: policyAr },
        deliveryTimes: { en: timesEn, ar: timesAr },
        deliveryAreas: { en: areasEn, ar: areasAr },
        shippingZones: zones,
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
        <h1 className="text-2xl font-bold text-safra-dark">{t("shippingSettings")}</h1>
        <p className="mt-1 text-sm text-safra-muted">{t("shippingDesc")}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* ─── Default Fee ───────────────────────────────────────────── */}
        <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm">
          <Input name="fee" label={t("defaultShippingFee")} type="number" step="0.01" value={fee} onChange={e => setFee(Number(e.target.value))} required />
          <p className="mt-1 text-xs text-safra-muted">{t("defaultShippingFeeHint")}</p>
        </div>

        {/* ─── Shipping Zones ─────────────────────────────────────────── */}
        <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-safra-dark">{t("deliveryZones")}</h3>
            <p className="mt-1 text-sm text-safra-muted">{t("deliveryZonesDesc")}</p>
          </div>

          {/* Zone List */}
          {zones.length > 0 ? (
            <div className="space-y-2">
              {zones.map((zone, i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg border border-safra-taupe/30 bg-safra-cream/20 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-safra-dark">{zone.name.en}</span>
                    <span className="mx-2 text-safra-taupe">|</span>
                    <span className="text-safra-muted" dir="rtl">{zone.name.ar}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm text-safra-muted">{t("zoneFee")}:</span>
                    <input
                      type="number"
                      value={zone.fee}
                      min={0}
                      step={0.01}
                      onChange={e => updateZoneFee(i, Number(e.target.value))}
                      className="w-24 rounded-lg border border-safra-taupe/40 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-safra-gold text-safra-dark"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeZone(i)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-safra-taupe/40 bg-safra-cream/10 p-6 text-center text-sm text-safra-muted">
              {t("noZones")}
            </div>
          )}

          {/* Add New Zone */}
          <div className="rounded-lg border border-safra-taupe/30 p-4 bg-safra-light/10 space-y-3">
            <p className="text-sm font-medium text-safra-dark">{t("addNewZone")}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Name (English)"
                type="text"
                placeholder="e.g. Cairo"
                value={newZoneEn}
                onChange={e => setNewZoneEn(e.target.value)}
                langValidate="en"
              />
              <Input
                label="Name (Arabic) — الاسم بالعربي"
                type="text"
                placeholder="مثال: القاهرة"
                value={newZoneAr}
                onChange={e => setNewZoneAr(e.target.value)}
                dir="rtl"
                langValidate="ar"
              />
            </div>
            <div className="flex items-end gap-3">
              <div>
                <label className="mb-1 block text-xs text-safra-muted">{t("zoneFee")}</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={newZoneFee}
                  onChange={e => setNewZoneFee(Number(e.target.value))}
                  className="w-32 rounded-lg border border-safra-taupe/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-safra-gold"
                />
              </div>
              <button
                type="button"
                onClick={addZone}
                className="flex items-center gap-2 rounded-lg bg-safra-gold px-4 py-2 text-sm font-medium text-safra-dark hover:opacity-90 transition"
              >
                <Plus className="h-4 w-4" />
                {t("addZone")}
              </button>
            </div>
          </div>
        </div>

        {/* ─── Shipping Policy ────────────────────────────────────────── */}
        <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6">
          <h3 className="font-semibold text-safra-dark">{t("shippingPolicy")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Textarea label={t("english")} value={policyEn} onChange={e => setPolicyEn(e.target.value)} rows={4} langValidate="en" />
            <Textarea label={t("arabic")} value={policyAr} onChange={e => setPolicyAr(e.target.value)} rows={4} dir="rtl" langValidate="ar" />
          </div>
        </div>

        {/* ─── Delivery Times ─────────────────────────────────────────── */}
        <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6">
          <h3 className="font-semibold text-safra-dark">{t("deliveryTimes")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Textarea label={t("english")} value={timesEn} onChange={e => setTimesEn(e.target.value)} rows={3} langValidate="en" />
            <Textarea label={t("arabic")} value={timesAr} onChange={e => setTimesAr(e.target.value)} rows={3} dir="rtl" langValidate="ar" />
          </div>
        </div>

        {/* ─── Delivery Areas (text) ──────────────────────────────────── */}
        <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6">
          <h3 className="font-semibold text-safra-dark">{t("deliveryAreas")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Textarea label={t("english")} value={areasEn} onChange={e => setAreasEn(e.target.value)} rows={3} langValidate="en" />
            <Textarea label={t("arabic")} value={areasAr} onChange={e => setAreasAr(e.target.value)} rows={3} dir="rtl" langValidate="ar" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {t("saveShipping")}
          </Button>
        </div>
      </form>
    </div>
  );
}
