"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import ProductsTable from "@/components/admin/products/ProductsTable";
import { getProducts, deleteProduct } from "@/lib/firebase/services/products-service";
import { getCategories } from "@/lib/firebase/services/categories-service";
import type { Product, Category } from "@/lib/types";
import { toast } from "sonner";
import { useLocale } from "next-intl";

export default function AdminProductsPage() {
  const locale = useLocale() as "en" | "ar";
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        toast.success("Product deleted");
        load();
      } catch (err) {
        toast.error("Failed to delete product");
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name[locale]?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter ? p.categoryId === categoryFilter : true;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-safra-dark">Products</h1>
          <p className="mt-1 text-sm text-safra-muted">Manage your product catalog.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="h-5 w-5" />
            Add Product
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
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name[locale]}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-safra-muted">Loading...</div>
      ) : (
        <ProductsTable products={filteredProducts} categories={categories} onDelete={handleDelete} />
      )}
    </div>
  );
}
