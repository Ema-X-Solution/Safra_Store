"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { createContactMessage } from "@/lib/firebase/services/contact-service";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { toast } from "sonner";
import { Send, Mail, Phone, MapPin, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const locale = useLocale() as "en" | "ar";
  const isAr = locale === "ar";

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      await createContactMessage({
        name: form.get("name") as string,
        email: form.get("email") as string,
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
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-safra-gold" />
        <h1 className="mt-6 text-2xl font-bold text-safra-dark">
          {isAr ? "تم إرسال رسالتك بنجاح!" : "Message Sent Successfully!"}
        </h1>
        <p className="mt-2 text-safra-muted">
          {isAr ? "سنتواصل معك في أقرب وقت ممكن." : "We'll get back to you as soon as possible."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-safra-dark sm:text-4xl">
          {isAr ? "تواصل معنا" : "Contact Us"}
        </h1>
        <p className="mt-3 text-safra-muted">
          {isAr ? "نسعد بتواصلك معنا. أرسل لنا رسالتك وسنرد عليك في أقرب وقت." : "We'd love to hear from you. Send us a message and we'll respond promptly."}
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-5">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5 rounded-2xl border border-safra-taupe/30 bg-white p-8 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input name="name" label={isAr ? "الاسم الكامل" : "Full Name"} required />
            <Input name="email" type="email" label={isAr ? "البريد الإلكتروني" : "Email Address"} required />
          </div>
          <Input name="subject" label={isAr ? "الموضوع" : "Subject"} required />
          <div className="space-y-1">
            <label className="text-sm font-medium text-safra-dark">
              {isAr ? "الرسالة" : "Message"}
            </label>
            <textarea
              name="message"
              required
              rows={5}
              className="w-full rounded-lg border border-safra-taupe/40 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-safra-gold/50 transition"
              placeholder={isAr ? "اكتب رسالتك هنا..." : "Write your message here..."}
            />
          </div>
          <Button type="submit" loading={loading} className="w-full gap-2">
            <Send className="h-4 w-4" />
            {isAr ? "إرسال الرسالة" : "Send Message"}
          </Button>
        </form>

        {/* Info Cards */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-safra-taupe/30 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-safra-gold/20">
                <Mail className="h-5 w-5 text-safra-gold" />
              </div>
              <h3 className="font-semibold text-safra-dark">{isAr ? "البريد الإلكتروني" : "Email"}</h3>
            </div>
            <p className="text-sm text-safra-muted">support@safrastore.com</p>
          </div>

          <div className="rounded-2xl border border-safra-taupe/30 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-safra-gold/20">
                <Phone className="h-5 w-5 text-safra-gold" />
              </div>
              <h3 className="font-semibold text-safra-dark">{isAr ? "الهاتف" : "Phone"}</h3>
            </div>
            <p className="text-sm text-safra-muted" dir="ltr">+20 123 456 7890</p>
          </div>

          <div className="rounded-2xl border border-safra-taupe/30 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-safra-gold/20">
                <MapPin className="h-5 w-5 text-safra-gold" />
              </div>
              <h3 className="font-semibold text-safra-dark">{isAr ? "العنوان" : "Address"}</h3>
            </div>
            <p className="text-sm text-safra-muted">
              {isAr ? "القاهرة، مصر" : "Cairo, Egypt"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
