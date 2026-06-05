import { Locale } from "@/i18n/routing";

// ─── Bilingual helper ───────────────────────────────────────────────
export type BilingualText = Record<Locale, string>;

// ─── Product ────────────────────────────────────────────────────────
export type ProductStatus = "active" | "draft" | "archived";

export interface ProductSpecification {
  key: BilingualText;
  value: BilingualText;
}

export interface ProductSEO {
  metaTitle: BilingualText;
  metaDescription: BilingualText;
}

export interface Product {
  id: string;
  name: BilingualText;
  slug: BilingualText;
  shortDescription: BilingualText;
  description: BilingualText;
  price: number;
  discountPrice?: number;
  image: string;
  images: string[];
  categoryId: string;
  stock: number;
  status: ProductStatus;
  featured?: boolean;
  bestSeller?: boolean;
  specifications: ProductSpecification[];
  seo?: ProductSEO;
  createdAt?: FirebaseTimestamp;
  updatedAt?: FirebaseTimestamp;
}

export interface ProductInput {
  name: BilingualText;
  slug: BilingualText;
  shortDescription: BilingualText;
  description: BilingualText;
  price: number;
  discountPrice?: number;
  image: string;
  images: string[];
  categoryId: string;
  stock: number;
  status: ProductStatus;
  featured?: boolean;
  bestSeller?: boolean;
  specifications: ProductSpecification[];
  seo?: ProductSEO;
}

// ─── Category ───────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: BilingualText;
  description?: BilingualText;
  slug: string;
  image?: string;
  order?: number;
  createdAt?: FirebaseTimestamp;
}

export interface CategoryInput {
  name: BilingualText;
  description?: BilingualText;
  slug: string;
  image?: string;
  order: number;
}

// ─── Order ──────────────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "cod" | "card" | "bank_transfer";

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  timestamp: FirebaseTimestamp;
  note?: string;
}

export interface OrderItem {
  productId: string;
  name: BilingualText;
  price: number;
  discountPrice?: number;
  image: string;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email?: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount?: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  statusHistory: OrderStatusHistoryEntry[];
  shippingAddress: ShippingAddress;
  couponCode?: string;
  notes?: string;
  createdAt: FirebaseTimestamp;
  updatedAt?: FirebaseTimestamp;
}

// ─── Customer ───────────────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpending: number;
  lastOrderDate: FirebaseTimestamp;
  createdAt: FirebaseTimestamp;
}

// ─── Coupon ─────────────────────────────────────────────────────────
export type CouponDiscountType = "percentage" | "fixed";

export interface Coupon {
  id: string;
  code: string;
  description: BilingualText;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiryDate: FirebaseTimestamp;
  usageLimit?: number;
  usageCount: number;
  active: boolean;
  createdAt?: FirebaseTimestamp;
}

export interface CouponInput {
  code: string;
  description: BilingualText;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiryDate: Date;
  usageLimit?: number;
  active: boolean;
}

// ─── FAQ ────────────────────────────────────────────────────────────
export interface FAQ {
  id: string;
  question: BilingualText;
  answer: BilingualText;
  order: number;
  createdAt?: FirebaseTimestamp;
}

export interface FAQInput {
  question: BilingualText;
  answer: BilingualText;
  order: number;
}

// ─── Shipping Info ──────────────────────────────────────────────────
export interface ShippingZone {
  name: BilingualText;   // e.g. { en: "Cairo", ar: "القاهرة" }
  fee: number;
}

export interface ShippingInfo {
  policy: BilingualText;
  deliveryTimes: BilingualText;
  deliveryAreas: BilingualText;
  shippingFee: number;          // default/fallback fee
  shippingZones?: ShippingZone[]; // per-zone pricing
  updatedAt?: FirebaseTimestamp;
}

// ─── Contact Message ────────────────────────────────────────────────
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: FirebaseTimestamp;
}

// ─── CMS Settings ───────────────────────────────────────────────────
export interface HeroSettings {
  title: BilingualText;
  subtitle: BilingualText;
  ctaText: BilingualText;
  bannerImage: string;
}

export interface BrandingSettings {
  logo: string;
  favicon: string;
  storeName: BilingualText;
}

export interface ContactInfo {
  email: string;
  phone: string;
  whatsapp: string;
  address: BilingualText;
}

export interface SocialMedia {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
}

export interface StoreConfig {
  currency: string;
  defaultLanguage: Locale;
  defaultShippingFee: number;
}

export interface CMSSettings {
  hero: HeroSettings;
  branding: BrandingSettings;
  contact: ContactInfo;
  social: SocialMedia;
  storeConfig: StoreConfig;
}

// ─── Notification ───────────────────────────────────────────────────
export type NotificationType = "new_order" | "order_status" | "low_stock" | "new_message";

export interface AdminNotification {
  id: string;
  type: NotificationType;
  orderId?: string;
  total?: number;
  customerName?: string;
  message?: string;
  read: boolean;
  createdAt: FirebaseTimestamp;
}

// ─── Cart ───────────────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

// ─── User ───────────────────────────────────────────────────────────
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

// ─── Firebase Timestamp ─────────────────────────────────────────────
export type FirebaseTimestamp = Date | { seconds: number; nanoseconds: number };

// ─── Utility functions ──────────────────────────────────────────────
export function getProductName(product: Product, locale: Locale): string {
  return product.name[locale];
}

export function getCategoryName(category: Category, locale: Locale): string {
  return category.name[locale];
}

export function getProductDescription(product: Product, locale: Locale): string {
  return product.description[locale];
}

export function getBilingualText(text: BilingualText | undefined, locale: Locale, fallback = ""): string {
  if (!text) return fallback;
  return text[locale] || fallback;
}

export function toDate(ts: FirebaseTimestamp | undefined | null): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  if ("seconds" in ts) return new Date(ts.seconds * 1000);
  return new Date();
}

export function formatFirebaseDate(ts: FirebaseTimestamp | undefined | null): string {
  return toDate(ts).toLocaleDateString();
}

export function formatFirebaseDateTime(ts: FirebaseTimestamp | undefined | null): string {
  return toDate(ts).toLocaleString();
}
