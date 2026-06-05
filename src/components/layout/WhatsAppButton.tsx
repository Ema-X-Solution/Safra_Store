"use client";

import { useEffect, useState } from "react";
import { getSettings } from "@/lib/firebase/services/settings-service";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const [whatsapp, setWhatsapp] = useState<string | null>(null);

  useEffect(() => {
    getSettings().then((settings) => {
      if (settings?.contact?.whatsapp) {
        // Strip non-numeric characters for the wa.me link
        const cleanedNumber = settings.contact.whatsapp.replace(/\D/g, '');
        setWhatsapp(cleanedNumber);
      }
    }).catch(console.error);
  }, []);

  if (!whatsapp) return null;

  return (
    <a
      href={`https://wa.me/${whatsapp}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 end-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
