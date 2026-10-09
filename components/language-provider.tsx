"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { setPublicData } from "@/lib/public-data";
import { myanmar, type Language } from "@/lib/translations";
const LanguageContext = createContext<{ language: Language; version: number; setLanguage: (language: Language) => void; t: (text: string) => string } | null>(null);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const publicDataSignature = useRef("");
  useEffect(() => {
    if (import.meta.env.DEV) return;
    const controller = new AbortController();
    const refreshPublicData = async () => {
      try {
        const response = await fetch("/api/storefront", { signal: controller.signal, cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json() as { data: Record<string, unknown> };
        const signature = JSON.stringify(result.data);
        if (signature === publicDataSignature.current) return;
        publicDataSignature.current = signature;
        setPublicData(result.data);
        setVersion(v => v + 1);
        window.dispatchEvent(new Event("storage"));
      } catch {
        // Keep the last successful catalog visible if a refresh is interrupted.
      }
    };
    void refreshPublicData();
    const timer = window.setInterval(() => void refreshPublicData(), 15_000);
    window.addEventListener("focus", refreshPublicData);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refreshPublicData); controller.abort(); };
  }, []);
  const [language, updateLanguage] = useState<Language>("en");
  useEffect(() => {
    const refresh = () => { try { updateLanguage(localStorage.getItem("uksein_language") === "my" ? "my" : "en"); } catch {} };
    refresh(); window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const setLanguage = (next: Language) => { updateLanguage(next); try { localStorage.setItem("uksein_language", next); } catch {} };
  return <LanguageContext.Provider value={{ language, version, setLanguage, t: (text) => language === "my" ? myanmar[text] ?? text : text }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("LanguageProvider is required");
  return context;
}
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return <select className="language-switcher" aria-label="Language / ဘာသာစကား" value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
    <option value="en" lang="en">English</option><option value="my" lang="my">မြန်မာ</option>
  </select>;
}
