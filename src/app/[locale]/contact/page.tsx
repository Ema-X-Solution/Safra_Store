"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { createContactMessage } from "@/lib/firebase/services/contact-service";
import { getSettings } from "@/lib/firebase/services/settings-service";
import type { CMSSettings } from "@/lib/types";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import { Send, Mail, Phone, MapPin, CheckCircle, Facebook, Instagram, Twitter, Linkedin, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const locale = useLocale() as "en" | "ar";
  const isAr = locale === "ar";

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [settings, setSettings] = useState<CMSSettings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings).catch(console.error);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      await createContactMessage({
        name: form.get("name") as string,
        email: form.get("email") as string,
        phone: form.get("phone") as string,
        subject: form.get("subject") as string,
        message: form.get("message") as string,
      });
      setSent(true);
    } catch {
      toast.error(isAr ? "حدث خطأ أثناء الإرسال" : "Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-safra-gold/20 text-safra-gold">
            <CheckCircle className="h-12 w-12" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-safra-dark">
          {isAr ? "تم إرسال رسالتك بنجاح!" : "Message Sent Successfully!"}
        </h1>
        <p className="mt-4 text-safra-muted">
          {isAr ? "سنتواصل معك في أقرب وقت ممكن. شكراً لتواصلك معنا." : "We'll get back to you as soon as possible. Thank you for reaching out."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative isolate bg-safra-cream/30 min-h-screen py-16 sm:py-24">
      {/* Decorative background shape */}
      <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-safra-taupe/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-safra-dark sm:text-5xl">
            {isAr ? "تواصل معنا" : "Get in touch"}
          </h1>
          <p className="mt-4 text-lg text-safra-muted">
            {isAr ? "نسعد بتواصلك معنا. أرسل لنا رسالتك وسنرد عليك في أقرب وقت." : "We'd love to hear from you. Send us a message and we'll respond promptly."}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Contact Info Sidebar - 2 columns on lg */}
          <div className="lg:col-span-2 rounded-[2rem] bg-safra-dark p-10 text-safra-cream shadow-2xl flex flex-col justify-between overflow-hidden relative">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-safra-olive/30 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-safra-gold/20 blur-3xl" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold mb-8">{isAr ? "معلومات التواصل" : "Contact Information"}</h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <Mail className="mt-1 h-6 w-6 shrink-0 text-safra-gold" />
                  <div>
                    <p className="font-medium text-lg">{isAr ? "البريد الإلكتروني" : "Email"}</p>
                    <a href={`mailto:${settings?.contact?.email || "support@safrastore.com"}`} className="mt-1 text-sm text-safra-cream/80 hover:text-safra-gold transition-colors block">
                      {settings?.contact?.email || "support@safrastore.com"}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Phone className="mt-1 h-6 w-6 shrink-0 text-safra-gold" />
                  <div>
                    <p className="font-medium text-lg">{isAr ? "الهاتف" : "Phone"}</p>
                    <a href={`tel:${settings?.contact?.phone || "+20 123 456 7890"}`} className="mt-1 text-sm text-safra-cream/80 hover:text-safra-gold transition-colors block" dir="ltr">
                      {settings?.contact?.phone || "+20 123 456 7890"}
                    </a>
                  </div>
                </div>

                {settings?.contact?.whatsapp && (
                  <div className="flex items-start gap-4">
                    <MessageCircle className="mt-1 h-6 w-6 shrink-0 text-safra-gold" />
                    <div>
                      <p className="font-medium text-lg">{isAr ? "واتساب" : "WhatsApp"}</p>
                      <a href={`https://wa.me/${settings.contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="mt-1 text-sm text-safra-cream/80 hover:text-safra-gold transition-colors block" dir="ltr">
                        {settings.contact.whatsapp}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <MapPin className="mt-1 h-6 w-6 shrink-0 text-safra-gold" />
                  <div>
                    <p className="font-medium text-lg">{isAr ? "العنوان" : "Address"}</p>
                    <p className="mt-1 text-sm text-safra-cream/80 leading-relaxed">
                      {settings?.contact?.address ? settings.contact.address[locale] : (isAr ? "القاهرة، مصر" : "Cairo, Egypt")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {settings?.social && (settings.social.facebook || settings.social.instagram || settings.social.twitter || settings.social.linkedin) && (
              <div className="relative z-10 mt-16 pt-8 border-t border-safra-olive/30">
                <p className="mb-4 text-sm font-medium text-safra-cream/80">{isAr ? "تابعنا على الشبكات الاجتماعية" : "Follow us on social media"}</p>
                <div className="flex items-center gap-4">
                  {settings.social.facebook && (
                    <a href={settings.social.facebook} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-safra-olive/40 text-safra-gold hover:bg-safra-gold hover:text-safra-dark transition-all hover:-translate-y-1">
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {settings.social.instagram && (
                    <a href={settings.social.instagram} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-safra-olive/40 text-safra-gold hover:bg-safra-gold hover:text-safra-dark transition-all hover:-translate-y-1">
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {settings.social.twitter && (
                    <a href={settings.social.twitter} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-safra-olive/40 text-safra-gold hover:bg-safra-gold hover:text-safra-dark transition-all hover:-translate-y-1">
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {settings.social.linkedin && (
                    <a href={settings.social.linkedin} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-safra-olive/40 text-safra-gold hover:bg-safra-gold hover:text-safra-dark transition-all hover:-translate-y-1">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form - 3 columns on lg */}
          <div className="lg:col-span-3 rounded-[2rem] bg-white p-8 sm:p-12 shadow-xl ring-1 ring-safra-taupe/10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-safra-dark mb-2">
                    {isAr ? "الاسم الكامل" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="block w-full rounded-xl border-0 py-3.5 px-4 text-safra-dark shadow-sm ring-1 ring-inset ring-safra-taupe/30 focus:ring-2 focus:ring-inset focus:ring-safra-gold sm:text-sm sm:leading-6 bg-safra-cream/5 transition-all hover:bg-white"
                    placeholder={isAr ? "محمد أحمد" : "John Doe"}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-safra-dark mb-2">
                    {isAr ? "البريد الإلكتروني" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    className="block w-full rounded-xl border-0 py-3.5 px-4 text-safra-dark shadow-sm ring-1 ring-inset ring-safra-taupe/30 focus:ring-2 focus:ring-inset focus:ring-safra-gold sm:text-sm sm:leading-6 bg-safra-cream/5 transition-all hover:bg-white"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-safra-dark mb-2">
                    {isAr ? "رقم الهاتف" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    className="block w-full rounded-xl border-0 py-3.5 px-4 text-safra-dark shadow-sm ring-1 ring-inset ring-safra-taupe/30 focus:ring-2 focus:ring-inset focus:ring-safra-gold sm:text-sm sm:leading-6 bg-safra-cream/5 transition-all hover:bg-white"
                    placeholder="+20 123 456 7890"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-safra-dark mb-2">
                    {isAr ? "الموضوع" : "Subject"}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    required
                    className="block w-full rounded-xl border-0 py-3.5 px-4 text-safra-dark shadow-sm ring-1 ring-inset ring-safra-taupe/30 focus:ring-2 focus:ring-inset focus:ring-safra-gold sm:text-sm sm:leading-6 bg-safra-cream/5 transition-all hover:bg-white"
                    placeholder={isAr ? "استفسار عن طلب..." : "Question about an order..."}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-safra-dark mb-2">
                  {isAr ? "الرسالة" : "Message"}
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={5}
                  required
                  className="block w-full rounded-xl border-0 py-3.5 px-4 text-safra-dark shadow-sm ring-1 ring-inset ring-safra-taupe/30 focus:ring-2 focus:ring-inset focus:ring-safra-gold sm:text-sm sm:leading-6 bg-safra-cream/5 transition-all hover:bg-white resize-none"
                  placeholder={isAr ? "اكتب رسالتك هنا بالتفصيل..." : "Write your message here in detail..."}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" loading={loading} className="w-full sm:w-auto px-8 py-4 rounded-xl shadow-lg shadow-safra-gold/20 hover:shadow-xl hover:shadow-safra-gold/30 transition-all group font-semibold">
                  <span className="flex items-center gap-2">
                    <Send className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                    {isAr ? "إرسال الرسالة" : "Send Message"}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
