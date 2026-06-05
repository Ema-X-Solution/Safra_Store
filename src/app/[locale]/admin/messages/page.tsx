"use client";

import { useEffect, useState, useCallback } from "react";
import { Mail, Check, Trash2 } from "lucide-react";
import { getContactMessages, markContactMessageRead, deleteContactMessage } from "@/lib/firebase/services/contact-service";
import type { ContactMessage } from "@/lib/types";
import { formatFirebaseDate } from "@/lib/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMessages(await getContactMessages());
    } catch (err) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (id: string) => {
    try {
      await markContactMessageRead(id);
      setMessages(msgs => msgs.map(m => m.id === id ? { ...m, read: true } : m));
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteContactMessage(deleteTarget);
      setMessages(msgs => msgs.filter(m => m.id !== deleteTarget));
      toast.success("Message deleted");
    } catch (err) {
      toast.error("Failed to delete message");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-safra-dark">Contact Messages</h1>
        <p className="mt-1 text-sm text-safra-muted">View messages from the store contact form.</p>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-safra-muted">Loading...</div>
      ) : messages.length === 0 ? (
        <div className="rounded-xl border border-safra-taupe/40 bg-white p-12 text-center shadow-sm">
          <p className="text-safra-muted">No messages found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`rounded-xl border border-safra-taupe/40 p-6 shadow-sm transition-colors ${msg.read ? 'bg-safra-cream/30' : 'bg-white'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${msg.read ? 'bg-safra-light/30 text-safra-olive' : 'bg-safra-gold text-safra-dark'}`}>
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-safra-dark">{msg.subject}</h3>
                    <p className="text-sm font-medium text-safra-muted">{msg.name} &lt;{msg.email}&gt;</p>
                    <p className="mt-1 text-xs text-safra-olive">{formatFirebaseDate(msg.createdAt)}</p>
                    <div className="mt-4 text-sm text-safra-dark bg-safra-light/10 p-4 rounded-lg border border-safra-taupe/20 whitespace-pre-wrap">
                      {msg.message}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {!msg.read && (
                    <button onClick={() => handleMarkRead(msg.id)} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-safra-olive hover:bg-safra-light/50 hover:text-safra-dark transition">
                      <Check className="h-4 w-4" />
                      Mark Read
                    </button>
                  )}
                  <button onClick={() => handleDelete(msg.id)} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Message"
        description="Are you sure you want to delete this message? This cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
