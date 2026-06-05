"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from "@/lib/firebase/services/faq-service";
import type { FAQ, FAQInput } from "@/lib/types";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useLocale } from "next-intl";

export default function AdminFAQPage() {
  const locale = useLocale() as "en" | "ar";
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setFaqs(await getFAQs());
    } catch (err) {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = () => {
    setEditingFaq(null);
    setModalOpen(true);
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteFAQ(deleteTarget);
      toast.success("FAQ deleted");
      load();
    } catch (err) {
      toast.error("Failed to delete FAQ");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data: FAQInput = {
      question: { en: form.get("qEn") as string, ar: form.get("qAr") as string },
      answer: { en: form.get("aEn") as string, ar: form.get("aAr") as string },
      order: Number(form.get("order") || 0),
    };

    try {
      if (editingFaq) {
        await updateFAQ(editingFaq.id, data);
        toast.success("FAQ updated");
      } else {
        await createFAQ(data);
        toast.success("FAQ created");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error("Failed to save FAQ");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-safra-dark">FAQ Management</h1>
          <p className="mt-1 text-sm text-safra-muted">Manage Frequently Asked Questions.</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-5 w-5" />
          Add FAQ
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-safra-muted">Loading...</div>
      ) : faqs.length === 0 ? (
        <div className="rounded-xl border border-safra-taupe/40 bg-white p-12 text-center shadow-sm">
          <p className="text-safra-muted">No FAQs found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="flex items-start gap-4 rounded-xl border border-safra-taupe/40 bg-white p-4 shadow-sm group">
              <div className="mt-1 text-safra-taupe cursor-grab active:cursor-grabbing">
                <GripVertical className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-safra-dark">{faq.question[locale]}</h3>
                <p className="mt-1 text-sm text-safra-muted line-clamp-2">{faq.answer[locale]}</p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(faq)} className="p-2 text-safra-olive hover:text-safra-dark hover:bg-safra-light/50 rounded-lg">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(faq.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingFaq ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="qEn" label="Question (English)" defaultValue={editingFaq?.question.en} required />
              <Input name="qAr" label="Question (Arabic)" defaultValue={editingFaq?.question.ar} dir="rtl" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Answer (English)</label>
                <textarea name="aEn" defaultValue={editingFaq?.answer.en} required rows={4} className="w-full rounded-lg border border-safra-taupe/40 p-2 focus:ring-1 focus:ring-safra-gold" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Answer (Arabic)</label>
                <textarea name="aAr" defaultValue={editingFaq?.answer.ar} required rows={4} dir="rtl" className="w-full rounded-lg border border-safra-taupe/40 p-2 focus:ring-1 focus:ring-safra-gold" />
              </div>
            </div>
            <Input name="order" label="Display Order" type="number" defaultValue={editingFaq?.order || faqs.length} />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete FAQ"
        description="Are you sure you want to delete this FAQ? This cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
