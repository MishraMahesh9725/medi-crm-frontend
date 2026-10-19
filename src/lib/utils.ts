import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian rupees with proper grouping.
 * e.g. 124500 → ₹1,24,500.00
 */
export function formatMoney(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a date as DD/MM/YYYY.
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Format a date as MM/YYYY (for expiry dates).
 */
export function formatExpiry(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${yyyy}`;
}

/**
 * Format a datetime with time component for display.
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return `${formatDate(d)} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

/**
 * Returns how many days until an expiry date (negative = already expired).
 */
export function daysUntilExpiry(date: string | Date | null | undefined): number | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Return an expiry status label.
 */
export function expiryStatus(date: string | Date | null | undefined): {
  label: string;
  variant: "expired" | "expiring" | "ok";
} {
  const days = daysUntilExpiry(date);
  if (days === null) return { label: "Unknown", variant: "ok" };
  if (days <= 0) return { label: "Expired", variant: "expired" };
  if (days <= 90) return { label: "Expires soon", variant: "expiring" };
  return { label: formatExpiry(date), variant: "ok" };
}

/**
 * Truncate text to a given length, appending '…'.
 */
export function truncate(text: string, len = 40): string {
  if (text.length <= len) return text;
  return text.slice(0, len) + "…";
}

/**
 * Build a URL query string from an object, skipping undefined/null/empty.
 */
export function buildQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      q.set(k, String(v));
    }
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}
