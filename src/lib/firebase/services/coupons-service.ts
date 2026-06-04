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
  query
} from "firebase/firestore";
import { getFirebaseDb } from "../config";
import type { Coupon, CouponInput } from "@/lib/types";

const COLLECTION = "coupons";

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

export async function createCoupon(data: CouponInput): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COLLECTION), {
    ...data,
    usageCount: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCoupon(id: string, data: Partial<CouponInput>) {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), data);
}

export async function deleteCoupon(id: string) {
  await deleteDoc(doc(getFirebaseDb(), COLLECTION, id));
}
