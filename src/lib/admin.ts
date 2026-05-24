import { getAdminEmailList } from "@/config/admins";

export function getAdminEmails(): string[] {
  return getAdminEmailList();
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}
