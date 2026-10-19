/**
 * Client-side auth helpers.
 * The JWT is stored in a cookie named `medibill_token`.
 * The cookie is set server-side via the Next.js route handler at /api/auth/login
 * so it can be made httpOnly in production.
 * For client-side reads (role-based menus) we also keep a non-httpOnly copy
 * in `medibill_user` as a JSON blob (no sensitive data there).
 */

export interface AuthUser {
  id: string;
  storeId: string;
  role: "OWNER" | "PHARMACIST" | "CASHIER";
  name: string;
  email: string | null;
}

export function getUser(): AuthUser | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)medibill_user=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthCookies(token: string, user: AuthUser) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  // httpOnly can only be set server-side; this is a client-accessible fallback
  document.cookie = `medibill_token=${encodeURIComponent(token)}; path=/; SameSite=Strict${secure}`;
  document.cookie = `medibill_user=${encodeURIComponent(JSON.stringify(user))}; path=/; SameSite=Strict${secure}`;
}

export function clearAuthCookies() {
  document.cookie = "medibill_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "medibill_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

export function isAuthenticated(): boolean {
  return !!getUser();
}
