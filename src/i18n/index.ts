import en from "./en.json";
import hi from "./hi.json";
import gu from "./gu.json";

type Lang = "en" | "hi" | "gu";

const translations: Record<Lang, Record<string, unknown>> = { en, hi, gu };

let currentLang: Lang = "en";

export function setLang(lang: Lang) {
  currentLang = lang;
}

export function getLang(): Lang {
  return currentLang;
}

/** Dot-notation key lookup with fallback to English. */
export function t(key: string, vars?: Record<string, string | number>): string {
  const dict = (translations[currentLang] ?? translations.en) as Record<string, unknown>;
  const parts = key.split(".");
  let value: unknown = dict;
  for (const p of parts) {
    if (value && typeof value === "object" && p in (value as object)) {
      value = (value as Record<string, unknown>)[p];
    } else {
      // fallback to English
      let fallback: unknown = translations.en as Record<string, unknown>;
      for (const fp of parts) {
        if (fallback && typeof fallback === "object" && fp in (fallback as object)) {
          fallback = (fallback as Record<string, unknown>)[fp];
        } else {
          return key; // key not found anywhere
        }
      }
      value = fallback;
      break;
    }
  }
  if (typeof value !== "string") return key;
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
