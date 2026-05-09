import { ADMIN_SESSION_COOKIE, SESSION_INDICATOR_MAX_AGE_SEC } from "./auth-session";

const STORAGE_KEY = "mymedu_admin_access_token";

function setSessionIndicatorCookie(): void {
  try {
    const secure =
      typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${ADMIN_SESSION_COOKIE}=1; Path=/; Max-Age=${SESSION_INDICATOR_MAX_AGE_SEC}; SameSite=Lax${secure}`;
  } catch {
    /* */
  }
}

function clearSessionIndicatorCookie(): void {
  try {
    document.cookie = `${ADMIN_SESSION_COOKIE}=; Path=/; Max-Age=0`;
  } catch {
    /* */
  }
}

/** همگام کوکی نشست با localStorage (مثلاً بعد از به‌روزرسانی یا حذف دستی یکی از دو طرف). */
export function syncSessionFromStorage(): void {
  if (typeof window === "undefined") return;
  if (getAccessToken()) {
    setSessionIndicatorCookie();
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, token);
    setSessionIndicatorCookie();
  } catch {
    /* quota / private mode */
  }
}

export function clearAccessToken(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    clearSessionIndicatorCookie();
  } catch {
    /* */
  }
}
