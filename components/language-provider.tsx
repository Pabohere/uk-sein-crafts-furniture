"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { myanmar, type Language } from "@/lib/translations";
const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void; t: (text: string) => string } | null>(null);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<Language>("en");
  useEffect(() => {
    const refresh = () => { try { updateLanguage(localStorage.getItem("uksein_language") === "my" ? "my" : "en"); } catch {} };
    refresh(); window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const setLanguage = (next: Language) => { updateLanguage(next); try { localStorage.setItem("uksein_language", next); } catch {} };
  return <LanguageContext.Provider value={{ language, setLanguage, t: (text) => language === "my" ? myanmar[text] ?? text : text }}>{children}</LanguageContext.Provider>;
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
