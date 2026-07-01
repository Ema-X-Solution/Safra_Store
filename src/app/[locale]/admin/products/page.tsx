"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import ProductsTable from "@/components/admin/products/ProductsTable";
import { getProducts, deleteProduct } from "@/lib/firebase/services/products-service";
import { getCategories } from "@/lib/firebase/services/categories-service";
import { getSubCategories } from "@/lib/firebase/services/subcategories-service";
import type { Product, Category, SubCategory } from "@/lib/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

export default function AdminProductsPage() {
  const locale = useLocale() as "en" | "ar";
  const t = useTranslations("admin");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
      
      const subsPromises = cats.map(c => getSubCategories(c.id));
      const subsArrays = await Promise.all(subsPromises);
      const allSubs = subsArrays.flat();
      setSubCategories(allSubs);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget);
      toast.success("Product deleted");
      load();
    } catch (err) {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name[locale]?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter ? p.categoryId === categoryFilter : true;
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesCat && matchesStatus;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-safra-dark">{t("products")}</h1>
          <p className="mt-1 text-sm text-safra-muted">{t("productsDesc")}</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="h-5 w-5" />
            {t("addProduct")}
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-safra-taupe/40 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-safra-muted" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-safra-taupe/40 focus:outline-none focus:ring-1 focus:ring-safra-gold"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-safra-taupe/40 bg-white px-4 py-2 focus:outline-none focus:ring-1 focus:ring-safra-gold"
        >
          <option value="">{locale === 'ar' ? 'كل الأقسام' : 'All Categories'}</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name[locale]}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-safra-taupe/40 bg-white px-4 py-2 focus:outline-none focus:ring-1 focus:ring-safra-gold"
        >
          <option value="">{locale === 'ar' ? 'كل الحالات' : 'All Statuses'}</option>
          <option value="active">{t("statusActive")}</option>
          <option value="inactive">{t("inactive")}</option>
        </select>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-safra-muted">{t("loading")}</div>
      ) : (
        <div className="space-y-4">
          <ProductsTable products={paginatedProducts} categories={categories} subCategories={subCategories} onDelete={handleDelete} />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-safra-taupe/40 shadow-sm text-sm text-safra-muted">
            <div>
              {t("showingProducts", {
                start: filteredProducts.length === 0 ? 0 : startIndex + 1,
                end: Math.min(startIndex + itemsPerPage, filteredProducts.length),
                total: filteredProducts.length
              })}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 h-auto"
                >
                  {t("previous")}
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                        currentPage === page 
                          ? "bg-safra-gold text-safra-dark font-medium" 
                          : "hover:bg-safra-light/30"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 h-auto"
                >
                  {t("next")}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
