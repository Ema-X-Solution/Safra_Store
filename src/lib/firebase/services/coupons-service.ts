import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "../config";
import type { Coupon, CouponInput } from "@/lib/types";

const COLLECTION = "coupons";

/** Remove all undefined values — Firebase rejects them */
function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export async function getCoupons(): Promise<Coupon[]> {
  const snap = await getDocs(collection(getFirebaseDb(), COLLECTION));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon));
}

export function subscribeToCoupons(callback: (coupons: Coupon[]) => void) {
  const q = query(collection(getFirebaseDb(), COLLECTION));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon)));
  });
}

export async function getCouponById(id: string): Promise<Coupon | null> {
  const snap = await getDoc(doc(getFirebaseDb(), COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Coupon;
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const q = query(collection(getFirebaseDb(), COLLECTION), where("code", "==", code));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as Coupon;
}

export async function createCoupon(data: CouponInput): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COLLECTION), {
    ...stripUndefined(data),
    usageCount: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCoupon(id: string, data: Partial<CouponInput>) {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), stripUndefined(data));
}

export async function deleteCoupon(id: string) {
  await deleteDoc(doc(getFirebaseDb(), COLLECTION, id));
}

export async function incrementCouponUsage(code: string) {
  const coupon = await getCouponByCode(code);
  if (!coupon) return;
  const { increment } = await import("firebase/firestore");
  await updateDoc(doc(getFirebaseDb(), COLLECTION, coupon.id), {
    usageCount: increment(1)
  });
}
