"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SingleImageUploader from "@/components/admin/shared/SingleImageUploader";
import { getSettings, updateSettings } from "@/lib/firebase/services/settings-service";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("homepage");

  // State
  const [heroTitleEn, setHeroTitleEn] = useState("");
  const [heroTitleAr, setHeroTitleAr] = useState("");
  const [heroSubEn, setHeroSubEn] = useState("");
  const [heroSubAr, setHeroSubAr] = useState("");
  const [heroCtaEn, setHeroCtaEn] = useState("");
  const [heroCtaAr, setHeroCtaAr] = useState("");
  const [heroImage, setHeroImage] = useState("");

  const [storeNameEn, setStoreNameEn] = useState("");
  const [storeNameAr, setStoreNameAr] = useState("");
  const [logo, setLogo] = useState("");
  
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [addressEn, setAddressEn] = useState("");
  const [addressAr, setAddressAr] = useState("");

  const [fb, setFb] = useState("");
  const [ig, setIg] = useState("");
  const [x, setX] = useState("");

  const [currency, setCurrency] = useState("SAR");
  const [defaultLang, setDefaultLang] = useState("ar");

  useEffect(() => {
    async function load() {
      try {
        const data = await getSettings();
        if (data) {
          setHeroTitleEn(data.hero?.title?.en || "");
          setHeroTitleAr(data.hero?.title?.ar || "");
          setHeroSubEn(data.hero?.subtitle?.en || "");
          setHeroSubAr(data.hero?.subtitle?.ar || "");
          setHeroCtaEn(data.hero?.ctaText?.en || "");
          setHeroCtaAr(data.hero?.ctaText?.ar || "");
          setHeroImage(data.hero?.bannerImage || "");

          setStoreNameEn(data.branding?.storeName?.en || "");
          setStoreNameAr(data.branding?.storeName?.ar || "");
          setLogo(data.branding?.logo || "");

          setEmail(data.contact?.email || "");
          setPhone(data.contact?.phone || "");
          setWhatsapp(data.contact?.whatsapp || "");
          setAddressEn(data.contact?.address?.en || "");
          setAddressAr(data.contact?.address?.ar || "");

          setFb(data.social?.facebook || "");
          setIg(data.social?.instagram || "");
          setX(data.social?.twitter || "");

          setCurrency(data.storeConfig?.currency || "SAR");
          setDefaultLang(data.storeConfig?.defaultLanguage || "ar");
        }
      } catch (err) {
        toast.error("Failed to load settings");
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
      await updateSettings({
        hero: {
          title: { en: heroTitleEn, ar: heroTitleAr },
          subtitle: { en: heroSubEn, ar: heroSubAr },
          ctaText: { en: heroCtaEn, ar: heroCtaAr },
          bannerImage: heroImage,
        },
        branding: { storeName: { en: storeNameEn, ar: storeNameAr }, logo, favicon: "" },
        contact: { email, phone, whatsapp, address: { en: addressEn, ar: addressAr } },
        social: { facebook: fb, instagram: ig, twitter: x, linkedin: "" },
        storeConfig: { currency, defaultLanguage: defaultLang as any, defaultShippingFee: 0 },
      });
      toast.success("Settings saved successfully");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-40 items-center justify-center text-safra-muted">Loading...</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-safra-dark">CMS Settings</h1>
        <p className="mt-1 text-sm text-safra-muted">Manage global store configurations and content.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-safra-taupe/30 pb-2 custom-scrollbar">
        {["homepage", "branding", "contact", "social", "config"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-safra-gold text-safra-dark' : 'text-safra-olive hover:bg-safra-light/30'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {activeTab === "homepage" && (
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-semibold text-safra-dark">Hero Section</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="htEn" label="Title (English)" value={heroTitleEn} onChange={e => setHeroTitleEn(e.target.value)} />
              <Input name="htAr" label="Title (Arabic)" value={heroTitleAr} onChange={e => setHeroTitleAr(e.target.value)} dir="rtl" />
              <Input name="hsEn" label="Subtitle (English)" value={heroSubEn} onChange={e => setHeroSubEn(e.target.value)} />
              <Input name="hsAr" label="Subtitle (Arabic)" value={heroSubAr} onChange={e => setHeroSubAr(e.target.value)} dir="rtl" />
              <Input name="hcEn" label="CTA Text (English)" value={heroCtaEn} onChange={e => setHeroCtaEn(e.target.value)} />
              <Input name="hcAr" label="CTA Text (Arabic)" value={heroCtaAr} onChange={e => setHeroCtaAr(e.target.value)} dir="rtl" />
            </div>
            <SingleImageUploader label="Banner Image" value={heroImage} onChange={setHeroImage} aspectRatio="video" />
          </div>
        )}

        {activeTab === "branding" && (
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-semibold text-safra-dark">Branding</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="snEn" label="Store Name (English)" value={storeNameEn} onChange={e => setStoreNameEn(e.target.value)} />
              <Input name="snAr" label="Store Name (Arabic)" value={storeNameAr} onChange={e => setStoreNameAr(e.target.value)} dir="rtl" />
            </div>
            <SingleImageUploader label="Logo" value={logo} onChange={setLogo} aspectRatio="square" />
          </div>
        )}

        {activeTab === "contact" && (
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-semibold text-safra-dark">Contact Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="em" label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              <Input name="ph" label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
              <Input name="wa" label="WhatsApp Number" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="adEn" label="Address (English)" value={addressEn} onChange={e => setAddressEn(e.target.value)} />
              <Input name="adAr" label="Address (Arabic)" value={addressAr} onChange={e => setAddressAr(e.target.value)} dir="rtl" />
            </div>
          </div>
        )}

        {activeTab === "social" && (
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-semibold text-safra-dark">Social Media Links</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="fb" label="Facebook URL" value={fb} onChange={e => setFb(e.target.value)} />
              <Input name="ig" label="Instagram URL" value={ig} onChange={e => setIg(e.target.value)} />
              <Input name="x" label="X (Twitter) URL" value={x} onChange={e => setX(e.target.value)} />
            </div>
          </div>
        )}

        {activeTab === "config" && (
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-semibold text-safra-dark">Store Configuration</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="cur" label="Currency Code (e.g. SAR, USD)" value={currency} onChange={e => setCurrency(e.target.value)} />
              <div className="space-y-1">
                <label className="text-sm font-medium text-safra-dark">Default Language</label>
                <select value={defaultLang} onChange={e => setDefaultLang(e.target.value)} className="w-full rounded-lg border border-safra-taupe/40 bg-white px-3 py-2 focus:border-safra-gold focus:outline-none focus:ring-1 focus:ring-safra-gold">
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-safra-taupe/30 bg-white/80 p-4 backdrop-blur-md lg:left-64">
          <div className="mx-auto flex max-w-4xl items-center justify-end">
            <Button type="submit" loading={saving} className="gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
