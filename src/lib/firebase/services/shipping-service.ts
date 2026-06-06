import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "../config";
import type { ShippingInfo } from "@/lib/types";

const DOC_ID = "main";
const COLLECTION = "shipping";

export async function getShippingInfo(): Promise<ShippingInfo | null> {
  try {
    const snap = await getDoc(doc(getFirebaseDb(), COLLECTION, DOC_ID));
    if (!snap.exists()) return null;
    return snap.data() as ShippingInfo;
  } catch (error) {
    console.error("Failed to fetch shipping info:", error);
    return null;
  }
}

export async function updateShippingInfo(data: Partial<ShippingInfo>) {
  await setDoc(
    doc(getFirebaseDb(), COLLECTION, DOC_ID),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
