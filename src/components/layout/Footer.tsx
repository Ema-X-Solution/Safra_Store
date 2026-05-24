import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Leaf } from "lucide-react";

export default async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");

  return (
    <footer className="mt-auto border-t border-safra-taupe/50 bg-safra-dark text-safra-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-safra-gold">
                <Leaf className="h-4 w-4 text-safra-dark" />
              </div>
              <span className="text-lg font-bold">Safra Store</span>
            </div>
            <p className="text-sm text-safra-taupe">{t("tagline")}</p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-safra-light">{t("shop")}</h3>
            <ul className="space-y-2 text-sm text-safra-taupe">
              <li>
                <Link href="/products" className="transition-colors hover:text-safra-cream">
                  {nav("products")}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="transition-colors hover:text-safra-cream">
                  {nav("cart")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-safra-light">{t("support")}</h3>
            <ul className="space-y-2 text-sm text-safra-taupe">
              <li>{t("contact")}</li>
              <li>{t("faq")}</li>
              <li>{t("shipping")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-safra-olive/50 pt-6 text-center text-sm text-safra-muted">
          &copy; {new Date().getFullYear()} Safra Store. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
