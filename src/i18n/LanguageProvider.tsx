import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dictionaries, languages, type LanguageCode } from "./copy";

type TranslationParams = Record<string, string | number>;

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  languages: typeof languages;
  t: (key: string, params?: TranslationParams) => string;
  getCopy: (key: string) => any;
}

const STORAGE_KEY = "bpmctrl_language";
const LanguageContext = createContext<LanguageContextValue | null>(null);

const readPath = (source: Record<string, any>, key: string) =>
  key.split(".").reduce<any>((value, part) => (value && value[part] !== undefined ? value[part] : undefined), source);

const format = (value: string, params?: TranslationParams) => {
  if (!params) return value;
  return Object.entries(params).reduce((text, [key, replacement]) => text.replaceAll(`{${key}}`, String(replacement)), value);
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    return saved && dictionaries[saved] ? saved : "en";
  });
  const { data: copyRows } = useQuery({
    queryKey: ["app_copy_overrides"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("site_content")
        .select("content_key, content_value")
        .eq("section", "app_copy");

      if (error) throw error;
      return (data || []) as Array<{ content_key: string; content_value: string }>;
    },
    retry: false,
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    const overrides = new Map((copyRows || []).map((row) => [row.content_key, row.content_value]));
    const setLanguage = (nextLanguage: LanguageCode) => {
      if (dictionaries[nextLanguage]) setLanguageState(nextLanguage);
    };

    const t = (key: string, params?: TranslationParams) => {
      const override = overrides.get(`${language}.${key}`) || overrides.get(`en.${key}`);
      if (typeof override === "string") return format(override, params);

      const translated = readPath(dictionaries[language], key);
      const fallback = readPath(dictionaries.en, key);
      return format(typeof translated === "string" ? translated : typeof fallback === "string" ? fallback : key, params);
    };

    const getCopy = (key: string) => readPath(dictionaries[language], key) ?? readPath(dictionaries.en, key);

    return { language, setLanguage, languages, t, getCopy };
  }, [copyRows, language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
};
