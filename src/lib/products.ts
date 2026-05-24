import { getProducts, getProductById, getFeaturedProducts } from "@/lib/firebase/firestore";
import type { Product } from "@/lib/types";

export async function fetchProducts(): Promise<Product[]> {
  return getProducts();
}

export async function fetchProductById(id: string): Promise<Product | null> {
  return getProductById(id);
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  return getFeaturedProducts();
}
