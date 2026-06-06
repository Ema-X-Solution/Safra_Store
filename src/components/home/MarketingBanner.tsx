import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import { Leaf, Droplet, Sparkles } from "lucide-react";

export default async function MarketingBanner() {
  const t = await getTranslations("banner");

  return (
    <section className="relative overflow-hidden bg-safra-olive py-16 sm:py-24 my-8 mx-4 sm:mx-6 lg:mx-8 rounded-3xl shadow-xl">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -start-24 h-96 w-96 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-24 -end-24 h-96 w-96 rounded-full bg-safra-gold blur-3xl" />
      </div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="text-center lg:text-start">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-lg text-safra-cream/90 max-w-2xl mx-auto lg:mx-0">
              {t("description")}
            </p>
            <div className="mt-8">
              <Link href="/products">
                <Button size="lg" className="bg-white text-safra-olive hover:bg-safra-cream shadow-lg border-none">
                  {t("cta")}
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-6 text-white backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 transition-colors">
              <Leaf className="mb-3 h-10 w-10 text-safra-gold" />
              <h3 className="text-lg font-semibold">{t("organic")}</h3>
              <p className="text-center text-sm text-safra-cream/80 mt-1">{t("organicDesc")}</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-6 text-white backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 transition-colors">
              <Droplet className="mb-3 h-10 w-10 text-safra-gold" />
              <h3 className="text-lg font-semibold">{t("pure")}</h3>
              <p className="text-center text-sm text-safra-cream/80 mt-1">{t("pureDesc")}</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-6 text-white backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 transition-colors">
              <Sparkles className="mb-3 h-10 w-10 text-safra-gold" />
              <h3 className="text-lg font-semibold">{t("premium")}</h3>
              <p className="text-center text-sm text-safra-cream/80 mt-1">{t("premiumDesc")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
