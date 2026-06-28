import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "../config";
import type { CMSSettings } from "@/lib/types";

const DOC_ID = "main";
const COLLECTION = "settings";

function convertFirestoreTimestamps<T extends Record<string, unknown>>(data: T): T {
  if (!data) return data;
  
  const result: Record<string, unknown> = { ...data };
  
  if (result.createdAt && result.createdAt instanceof Timestamp) {
    result.createdAt = {
      seconds: result.createdAt.seconds,
      nanoseconds: result.createdAt.nanoseconds,
    };
  }
  
  if (result.updatedAt && result.updatedAt instanceof Timestamp) {
    result.updatedAt = {
      seconds: result.updatedAt.seconds,
      nanoseconds: result.updatedAt.nanoseconds,
    };
  }
  
  return result as T;
}

export async function getSettings(): Promise<CMSSettings | null> {
  try {
    const snap = await getDoc(doc(getFirebaseDb(), COLLECTION, DOC_ID));
    if (!snap.exists()) return null;
    return convertFirestoreTimestamps(snap.data()) as CMSSettings;
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
