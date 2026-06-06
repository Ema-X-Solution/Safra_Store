"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/config";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/firebase/admin-firestore";
import Price from "@/components/ui/Price";
import type { AdminNotification } from "@/lib/types";
import { Bell, X, ShoppingBag, Mail, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";

export default function AdminNotifications() {
  const t = useTranslations("admin");
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [open, setOpen] = useState(false);
  // Track IDs we've already seen so we can detect truly new ones
  const seenIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const q = query(collection(getFirebaseDb(), "notifications"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const incoming = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminNotification));
      setNotifications(incoming);

      if (isFirstLoad.current) {
        // Seed seen IDs from first snapshot – don't toast for existing ones
        incoming.forEach((n) => seenIds.current.add(n.id));
        isFirstLoad.current = false;
        return;
      }

      // Show a toast for each brand-new notification
      incoming.forEach((n) => {
        if (!seenIds.current.has(n.id)) {
          seenIds.current.add(n.id);
          if (n.type === "new_order") {
            toast.success(`🛒 New order from ${n.customerName || "Customer"}`, {
              description: n.total ? `Total: ${n.total} EGP` : undefined,
              duration: 6000,
            });
          } else if (n.type === "new_message") {
            toast.info(`💬 New message from ${n.customerName || "Visitor"}`, {
              description: n.message || "Contact form submission",
              duration: 6000,
            });
          }
        }
      });
    });
    return unsub;
  }, []);

  async function handleRead(id: string) {
    await markNotificationRead(id);
  }

  async function handleReadAll() {
    await markAllNotificationsRead();
  }

  function getIcon(type: AdminNotification["type"]) {
    if (type === "new_message") return <Mail className="h-4 w-4" />;
    return <ShoppingBag className="h-4 w-4" />;
  }

  function getIconBg(type: AdminNotification["type"], read: boolean) {
    if (read) return "bg-safra-taupe/20 text-safra-muted";
    if (type === "new_message") return "bg-blue-100 text-blue-600";
    return "bg-safra-gold/20 text-safra-gold";
  }

  function getLink(n: AdminNotification) {
    if (n.type === "new_message") return "/admin/messages";
    return "/admin/orders";
  }

  function getLinkLabel(n: AdminNotification) {
    if (n.type === "new_message") return "View Messages";
    return t("viewOrder");
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
          <span className="absolute -end-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute end-0 top-full z-50 mt-2 w-96 rounded-2xl border border-safra-taupe/40 bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-safra-taupe/20 px-5 py-4 bg-safra-dark">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-safra-gold" />
                <h3 className="font-semibold text-safra-cream">{t("notifications")}</h3>
                {unread > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {unread}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unread > 0 && (
                  <button
                    onClick={handleReadAll}
                    className="flex items-center gap-1 text-xs text-safra-gold hover:text-safra-light transition-colors"
                  >
                    <Check className="h-3 w-3" />
                    {t("markAllRead")}
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-safra-cream/60 hover:text-safra-cream transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-safra-taupe/10">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-safra-muted">
                  <Bell className="h-10 w-10 opacity-20" />
                  <p className="text-sm">{t("noNotifications")}</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-5 py-4 transition-colors ${!n.read ? "bg-safra-cream/40" : "hover:bg-gray-50"}`}
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getIconBg(n.type, n.read)}`}>
                      {getIcon(n.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-safra-dark truncate">
                        {n.type === "new_message"
                          ? `رسالة من ${n.customerName || "زائر"}`
                          : t("newOrderFrom", { name: n.customerName || "Customer" })}
                      </p>
                      {n.type === "new_order" && n.total != null && (
                        <p className="text-sm font-semibold text-safra-gold mt-0.5">
                          <Price amount={n.total} />
                        </p>
                      )}
                      {n.type === "new_message" && n.message && (
                        <p className="text-xs text-safra-muted mt-0.5 truncate">{n.message}</p>
                      )}
                      <div className="mt-2 flex items-center gap-3">
                        <Link
                          href={getLink(n)}
                          onClick={() => {
                            if (!n.read) handleRead(n.id);
                            setOpen(false);
                          }}
                          className="text-xs font-medium text-safra-gold hover:text-safra-deep-gold transition-colors"
                        >
                          {getLinkLabel(n)} →
                        </Link>
                        {!n.read && (
                          <button
                            onClick={() => handleRead(n.id)}
                            className="text-xs text-safra-muted hover:text-safra-dark transition-colors"
                          >
                            {t("markRead")}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-red-500 shrink-0" />
                    )}
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
