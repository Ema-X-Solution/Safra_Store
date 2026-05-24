export const AUTH_STORAGE_KEY = "safra-user";

export interface StoredUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export function saveUserToStorage(user: StoredUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function getUserFromStorage(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function clearUserFromStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function firebaseUserToStored(user: {
  uid: string;
  email: string | null;
  displayName: string | null;
}): StoredUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  };
}
