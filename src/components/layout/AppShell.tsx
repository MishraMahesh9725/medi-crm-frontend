"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getUser, clearAuthCookies, type AuthUser } from "@/lib/auth";
import {
  LayoutDashboard,
  Receipt,
  Package,
  ShoppingCart,
  Users,
  Truck,
  Bell,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Stethoscope,
} from "lucide-react";
import { t } from "@/i18n";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: ("OWNER" | "PHARMACIST" | "CASHIER")[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: t("nav.home"), icon: LayoutDashboard, roles: ["OWNER", "PHARMACIST", "CASHIER"] },
  { href: "/billing/new", label: t("nav.newBill"), icon: Receipt, roles: ["OWNER", "PHARMACIST", "CASHIER"] },
  { href: "/sales", label: t("nav.sales"), icon: ShoppingCart, roles: ["OWNER", "PHARMACIST", "CASHIER"] },
  { href: "/customers", label: t("nav.customers"), icon: Users, roles: ["OWNER", "PHARMACIST", "CASHIER"] },
  { href: "/inventory", label: t("nav.inventory"), icon: Package, roles: ["OWNER", "PHARMACIST"] },
  { href: "/purchases", label: t("nav.purchases"), icon: Truck, roles: ["OWNER", "PHARMACIST"] },
  { href: "/suppliers", label: t("nav.suppliers"), icon: Truck, roles: ["OWNER", "PHARMACIST"] },
  { href: "/refills", label: t("nav.refills"), icon: Bell, roles: ["OWNER", "PHARMACIST"] },
  { href: "/register", label: t("nav.register"), icon: BookOpen, roles: ["OWNER", "PHARMACIST"] },
  { href: "/settings", label: t("nav.settings"), icon: Settings, roles: ["OWNER", "PHARMACIST", "CASHIER"] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setUser(u);
  }, [router]);

  function handleLogout() {
    clearAuthCookies();
    router.replace("/login");
  }

  const visibleNav = user
    ? NAV_ITEMS.filter((item) => item.roles.includes(user.role))
    : [];

  // Bottom tabs on mobile: only the first 5 items
  const mobileNavItems = visibleNav.slice(0, 5);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar (desktop) ─────────────────────────────────── */}
      <aside
        className={cn(
          "hidden md:flex flex-col w-60 bg-white border-r border-[#E2EEEC] shrink-0",
          "h-screen sticky top-0"
        )}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#E2EEEC]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[8px] bg-[#2F8F83] flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg text-[#1F2D2B]">MediBill</span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {visibleNav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[15px] font-medium transition-colors",
                  "min-h-[44px]",
                  active
                    ? "bg-[#E4F3F1] text-[#2F8F83]"
                    : "text-[#5A7370] hover:bg-[#F3F7F6] hover:text-[#1F2D2B]"
                )}
              >
                <item.icon className={cn("w-4.5 h-4.5 shrink-0", active ? "text-[#2F8F83]" : "")} style={{ width: 18, height: 18 }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        {user && (
          <div className="border-t border-[#E2EEEC] px-4 py-4">
            <p className="text-sm font-medium text-[#1F2D2B] truncate">{user.name}</p>
            <p className="text-xs text-[#5A7370] mb-3">{user.role}</p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-[#5A7370] hover:text-[#1F2D2B] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t("nav.logout")}
            </button>
          </div>
        )}
      </aside>

      {/* ── Mobile sidebar overlay ─────────────────────────── */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-72 bg-white h-full flex flex-col shadow-xl">
            <div className="px-5 py-4 border-b border-[#E2EEEC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[6px] bg-[#2F8F83] flex items-center justify-center">
                  <Stethoscope className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold text-[#1F2D2B]">MediBill</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded text-[#5A7370]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
              {visibleNav.map((item) => {
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-[10px] text-base font-medium transition-colors",
                      active ? "bg-[#E4F3F1] text-[#2F8F83]" : "text-[#5A7370] hover:bg-[#F3F7F6]"
                    )}
                  >
                    <item.icon style={{ width: 18, height: 18 }} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            {user && (
              <div className="border-t border-[#E2EEEC] px-4 py-4">
                <p className="text-sm font-medium text-[#1F2D2B]">{user.name}</p>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm text-[#5A7370] mt-2"
                >
                  <LogOut className="w-4 h-4" /> {t("nav.logout")}
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ── Main content ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#E2EEEC] sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-[8px] text-[#5A7370] hover:bg-[#F3F7F6]"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-[#1F2D2B]">MediBill</span>
          <div className="w-8" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>

        {/* ── Mobile bottom tab bar ─────────────────────────── */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#E2EEEC] z-30">
          <div className="flex">
            {mobileNavItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[56px]",
                    "text-[11px] font-medium transition-colors",
                    active ? "text-[#2F8F83]" : "text-[#5A7370]"
                  )}
                >
                  <item.icon style={{ width: 20, height: 20 }} />
                  <span className="truncate max-w-[60px]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
