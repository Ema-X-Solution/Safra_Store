import { getCategories } from "@/lib/firebase/firestore";
import type { Category } from "@/lib/types";

export async function fetchCategories(): Promise<Category[]> {
  return getCategories();
}
