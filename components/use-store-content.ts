"use client";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { defaultContent, readContent, type StoreContent } from "@/lib/store-content";
export function useStoreContent() {
  const { language, version } = useLanguage();
  const [content, setContent] = useState<StoreContent>(defaultContent);
  useEffect(() => {
    const refresh = () => setContent(readContent(language));
    refresh(); window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [language, version]);
  return content;
}
