import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Leaf, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { getSettings } from "@/lib/firebase/services/settings-service";
import Image from "next/image";

export default async function Footer() {
  const locale = await getLocale();
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const settings = await getSettings();

  const contact = settings?.contact;
  const social = settings?.social;
  const branding = settings?.branding;

  return (
    <footer className="mt-auto border-t border-safra-taupe/50 bg-safra-dark text-safra-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-safra-gold overflow-hidden relative shadow-sm">
                {branding?.logo ? (
                  <Image src={branding.logo} alt="Store Logo" fill className="object-cover" />
                ) : (
                  <Leaf className="h-5 w-5 text-safra-dark" />
                )}
              </div>
              <span className="text-xl font-bold">
                {branding?.storeName ? branding.storeName[locale as 'en' | 'ar'] : "Safra Store"}
              </span>
            </div>
            <p className="text-sm text-safra-taupe leading-relaxed">
              {branding?.description ? branding.description[locale as 'en' | 'ar'] : t("tagline")}
            </p>
            
            {social && (
              <div className="mt-6 flex items-center gap-3">
                {social.facebook && (
                  <a href={social.facebook} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-safra-olive/30 text-safra-gold hover:bg-safra-gold hover:text-safra-dark transition">
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {social.instagram && (
                  <a href={social.instagram} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-safra-olive/30 text-safra-gold hover:bg-safra-gold hover:text-safra-dark transition">
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {social.twitter && (
                  <a href={social.twitter} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-safra-olive/30 text-safra-gold hover:bg-safra-gold hover:text-safra-dark transition">
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {social.linkedin && (
                  <a href={social.linkedin} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-safra-olive/30 text-safra-gold hover:bg-safra-gold hover:text-safra-dark transition">
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
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
              <li>
                <Link href="/contact" className="transition-colors hover:text-safra-cream">
                  {t("contact")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition-colors hover:text-safra-cream">
                  {t("faq")}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="transition-colors hover:text-safra-cream">
                  {t("shipping")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-safra-light">{t("contact")}</h3>
            <ul className="space-y-3 text-sm text-safra-taupe">
              {contact?.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-safra-gold" />
                  <a href={`mailto:${contact.email}`} className="hover:text-safra-cream transition">{contact.email}</a>
                </li>
              )}
              {contact?.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-safra-gold" />
                  <a href={`tel:${contact.phone}`} className="hover:text-safra-cream transition" dir="ltr">{contact.phone}</a>
                </li>
              )}
              {/* Note: address is BilingualText so we'd need locale to display it correctly, but we'll skip for now or we can use next-intl useLocale if it was a client component. Since this is a server component, we can use getLocale. */}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-safra-olive/50 pt-6 text-center text-sm text-safra-muted">
          &copy; {new Date().getFullYear()} {branding?.storeName ? branding.storeName[locale as 'en' | 'ar'] : "Safra Store"}. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
