import { Locale } from "@/i18n/routing";

export interface Product {
  id: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  price: number;
  image: string;
  categoryId: string;
  stock: number;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: Record<Locale, string>;
  slug: string;
  order?: number;
}

export interface AdminNotification {
  id: string;
  type: "new_order";
  orderId: string;
  total: number;
  customerName: string;
  read: boolean;
  createdAt: Date | { seconds: number; nanoseconds: number };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  name: Record<Locale, string>;
  price: number;
  image: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date | { seconds: number; nanoseconds: number };
  shippingAddress: ShippingAddress;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered";

export interface ProductInput {
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  price: number;
  image: string;
  categoryId: string;
  stock: number;
  featured?: boolean;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

export function getProductName(product: Product, locale: Locale): string {
  return product.name[locale];
}

export function getCategoryName(category: Category, locale: Locale): string {
  return category.name[locale];
}

export function getProductDescription(product: Product, locale: Locale): string {
  return product.description[locale];
}
