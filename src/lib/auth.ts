import { User } from "@/types";

export const tokenKey = "sipesa_token";
export const userKey = "sipesa_user";

export function saveSession(token: string, user: User) {
  localStorage.setItem(tokenKey, token);
  localStorage.setItem(userKey, JSON.stringify(user));
  document.cookie = `${tokenKey}=${token}; path=/; max-age=7200; SameSite=Lax`;
}

export function clearSession() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
  document.cookie = `${tokenKey}=; path=/; max-age=0; SameSite=Lax`;
}

export function currentUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(userKey);
  return raw ? (JSON.parse(raw) as User) : null;
}
