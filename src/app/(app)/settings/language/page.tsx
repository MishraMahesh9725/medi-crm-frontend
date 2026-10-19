"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStore, updateStore } from "@/services/stores.service";
import { useToast } from "@/components/shared/Toast";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
] as const;

type LangCode = "en" | "hi" | "gu";

export default function LanguageSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data } = useQuery({ queryKey: ["store"], queryFn: getStore });
  const currentLang = (data?.data?.language ?? "en") as LangCode;
  const [selected, setSelected] = useState<LangCode | null>(null);

  const active = selected ?? currentLang;

  const mutation = useMutation({
    mutationFn: (lang: LangCode) => updateStore({ language: lang }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["store"] });
      toast("Language updated. Refresh to see changes.");
    },
    onError: (err) => {
      toast(err instanceof ApiError ? err.message : "Could not update language.", "error");
    },
  });

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()}
          className="p-2 rounded-[8px] border border-[#E2EEEC] text-[#5A7370] hover:bg-[#F3F7F6]" aria-label="Back">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-semibold text-[#1F2D2B]">Language</h1>
      </div>

      <p className="text-sm text-[#5A7370] mb-5">Choose the language for your store.</p>

      <div className="space-y-3">
        {LANGUAGES.map((lang) => (
          <button key={lang.code} type="button"
            onClick={() => setSelected(lang.code)}
            className={cn(
              "w-full flex items-center justify-between px-5 py-4 rounded-[12px] border-2 transition-colors min-h-[64px]",
              active === lang.code
                ? "border-[#2F8F83] bg-[#E4F3F1]"
                : "border-[#E2EEEC] bg-white hover:border-[#2F8F83]/30"
            )}>
            <div className="text-left">
              <p className="font-semibold text-[#1F2D2B]">{lang.label}</p>
              <p className="text-sm text-[#5A7370]">{lang.native}</p>
            </div>
            {active === lang.code && (
              <div className="w-5 h-5 rounded-full bg-[#2F8F83] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => selected && mutation.mutate(selected)}
        disabled={!selected || selected === currentLang || mutation.isPending}
        className="w-full min-h-[52px] mt-5 bg-[#2F8F83] text-white font-semibold rounded-[12px] hover:bg-[#236F65] disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        Save language
      </button>
    </div>
  );
}
