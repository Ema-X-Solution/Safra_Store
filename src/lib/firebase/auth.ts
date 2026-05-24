import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "./config";
import { isAdminEmail } from "@/lib/admin";
import { ensureAdminRecord } from "./admin-firestore";

export async function signUp(email: string, password: string, displayName: string) {
  const auth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });

  // Don't await — setDoc can hang when Firestore rules block writes
  void setDoc(doc(getFirebaseDb(), "users", credential.user.uid), {
    email,
    displayName,
    createdAt: serverTimestamp(),
  }).catch((err) => console.warn("Could not save user profile to Firestore:", err));

  if (isAdminEmail(credential.user.email)) {
    void ensureAdminRecord(credential.user.uid, credential.user.email!);
  }

  return credential.user;
}

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  if (isAdminEmail(credential.user.email)) {
    void ensureAdminRecord(credential.user.uid, credential.user.email!);
  }
  return credential.user;
}

export async function logOut() {
  await signOut(getFirebaseAuth());
}

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(getFirebaseDb(), "users", uid));
  return snap.exists() ? snap.data() : null;
}

export { onAuthStateChanged, type User };
