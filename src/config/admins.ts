/** Admin emails — merged with NEXT_PUBLIC_ADMIN_EMAILS from .env */
export const DEFAULT_ADMIN_EMAILS = ["andkpe12@gmail.com"];


export function getAdminEmailList(): string[] {
  const fromEnv =
    typeof process !== "undefined"
      ? (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean)
      : [];

  return [...new Set([...DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase()), ...fromEnv])];
}
