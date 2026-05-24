"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/config";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/firebase/admin-firestore";
import { formatPrice } from "@/lib/utils";
import type { AdminNotification } from "@/lib/types";
import { Bell, X } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function AdminNotifications() {
  const t = useTranslations("admin");
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [open, setOpen] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const q = query(collection(getFirebaseDb(), "notifications"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminNotification)));
    });
    return unsub;
  }, []);

  async function handleRead(id: string) {
    await markNotificationRead(id);
  }

  async function handleReadAll() {
    await markAllNotificationsRead();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-safra-olive transition-colors hover:bg-safra-light/50"
        aria-label={t("notifications")}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute end-0 top-full z-50 mt-2 w-80 rounded-xl border border-safra-taupe/40 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-safra-taupe/30 px-4 py-3">
              <h3 className="font-semibold text-safra-dark">{t("notifications")}</h3>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={handleReadAll} className="text-xs text-safra-gold hover:underline">
                    {t("markAllRead")}
                  </button>
                )}
                <button onClick={() => setOpen(false)}>
                  <X className="h-4 w-4 text-safra-muted" />
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-sm text-safra-muted">{t("noNotifications")}</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`border-b border-safra-taupe/20 px-4 py-3 ${!n.read ? "bg-safra-light/30" : ""}`}
                  >
                    <p className="text-sm font-medium text-safra-dark">
                      {t("newOrderFrom", { name: n.customerName })}
                    </p>
                    <p className="text-sm text-safra-deep-gold">{formatPrice(n.total)}</p>
                    <div className="mt-2 flex gap-2">
                      <Link
                        href="/admin/orders"
                        onClick={() => {
                          if (!n.read) handleRead(n.id);
                          setOpen(false);
                        }}
                        className="text-xs text-safra-gold hover:underline"
                      >
                        {t("viewOrder")}
                      </Link>
                      {!n.read && (
                        <button onClick={() => handleRead(n.id)} className="text-xs text-safra-muted hover:underline">
                          {t("markRead")}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
