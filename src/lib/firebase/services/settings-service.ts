import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "../config";
import type { CMSSettings } from "@/lib/types";

const DOC_ID = "main";
const COLLECTION = "settings";

export async function getSettings(): Promise<CMSSettings | null> {
  try {
    const snap = await getDoc(doc(getFirebaseDb(), COLLECTION, DOC_ID));
    if (!snap.exists()) return null;
    return snap.data() as CMSSettings;
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return null;
  }
}

export async function updateSettings(data: Partial<CMSSettings>) {
  await setDoc(
    doc(getFirebaseDb(), COLLECTION, DOC_ID),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
