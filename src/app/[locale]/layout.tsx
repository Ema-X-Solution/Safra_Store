import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter, Cairo } from "next/font/google";
import { routing, type Locale } from "@/i18n/routing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import FooterWrapper from "@/components/layout/FooterWrapper";
import Providers from "@/components/providers/Providers";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { getSettings } from "@/lib/firebase/services/settings-service";
import "../globals.css";
import "swiper/css";
import "swiper/css/navigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("title"),
    description: t("description"),
    icons: {
      icon: [{ url: "/favicon.ico", sizes: "any" }],
      shortcut: "/favicon.ico",
      apple: "/logo.png",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const settings = await getSettings();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const fontClass = locale === "ar" ? "font-arabic" : "font-sans";

  return (
    <html lang={locale} dir={dir}>
      <body className={`${inter.variable} ${cairo.variable} ${fontClass} flex min-h-screen flex-col antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <HeaderWrapper>
              <Header branding={settings?.branding} />
            </HeaderWrapper>
            <main className="flex-1 flex flex-col">{children}</main>
            <FooterWrapper>
              <Footer />
            </FooterWrapper>
            <WhatsAppButton />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
