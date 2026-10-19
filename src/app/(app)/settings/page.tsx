"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Users, Globe, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

const SETTINGS_MENU = [
  { href: "/settings/store", icon: Store, label: "Store details", desc: "Name, GSTIN, drug licence, UPI ID, invoice prefix" },
  { href: "/settings/team", icon: Users, label: "Team", desc: "Manage staff and their access levels" },
  { href: "/settings/language", icon: Globe, label: "Language", desc: "English, Hindi, or Gujarati" },
];

export default function SettingsPage() {
  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title="Settings" help="Manage your store and team." />

      <div className="bg-white rounded-[14px] border border-[#E2EEEC] divide-y divide-[#E2EEEC]">
        {SETTINGS_MENU.map((item) => (
          <Link key={item.href} href={item.href}
            className="flex items-center gap-4 px-5 py-4 hover:bg-[#F3F7F6] transition-colors">
            <div className="w-10 h-10 rounded-[10px] bg-[#E4F3F1] flex items-center justify-center shrink-0">
              <item.icon className="w-5 h-5 text-[#2F8F83]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#1F2D2B]">{item.label}</p>
              <p className="text-sm text-[#5A7370] truncate">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#5A7370] shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
