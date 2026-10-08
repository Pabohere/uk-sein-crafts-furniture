import { publicData } from "./public-data";
import { myanmar, type Language } from "@/lib/translations";
import { textLanguage } from "@/lib/typography";
export type EventPost = { id: string; date: string; title: string; image: string; button: string };
export type StoreContent = { home: { eyebrow: string; title: string; accent: string; intro: string; cta: string; collectionEyebrow: string; collectionHeading: string; heroImages: string[] }; about: { eyebrow: string; title: string; accent: string; intro: string; value1Title: string; value1Text: string; value2Title: string; value2Text: string; value3Title: string; value3Text: string }; events: { eyebrow: string; title: string; intro: string } };
export const defaultContent: StoreContent = { home: { eyebrow: "YANGON · MYANMAR", title: "Made by hand.", accent: "Meant for home.", intro: "Thoughtful rattan furniture and local crafts for slower, warmer living.", cta: "Shop the collection", collectionEyebrow: "CURATED PIECES", collectionHeading: "Everyday objects, beautifully made.", heroImages: ["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=88", "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=88", "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=88", "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=88"] }, about: { eyebrow: "OUR STORY", title: "Made in Myanmar,", accent: "for your home.", intro: "Uk Sein celebrates natural materials and the enduring skill of local craft.", value1Title: "Local makers", value1Text: "We celebrate the techniques makers keep alive.", value2Title: "Natural materials", value2Text: "Rattan, cane and wood bring calm to a home.", value3Title: "Built to stay", value3Text: "Pieces for a home that evolves with you." }, events: { eyebrow: "IN THE SHOWROOM", title: "Events & workshops", intro: "Join us for maker conversations, styling sessions, and seasonal collections." } };
export const defaultEvents: EventPost[] = [{ id: "event-1", date: "24 NOVEMBER · YANGON", title: "Rattan care workshop", button: "Reserve a place", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=85" }, { id: "event-2", date: "8 DECEMBER · SHOWROOM", title: "Holiday home styling", button: "Reserve a place", image: "https://images.unsplash.com/photo-1513159446162-54eb8bdaa79b?auto=format&fit=crop&w=900&q=85" }];
const readLegacyContent = (): StoreContent => { if (typeof window === "undefined") return defaultContent; try { const saved = JSON.parse(localStorage.getItem("uksein_content") || "{}"); return { ...defaultContent, ...saved, home: { ...defaultContent.home, ...saved.home, heroImages: Array.isArray(saved.home?.heroImages) && saved.home.heroImages.filter(Boolean).length ? saved.home.heroImages : defaultContent.home.heroImages }, about: { ...defaultContent.about, ...saved.about }, events: { ...defaultContent.events, ...saved.events } }; } catch { return defaultContent; } };

const readLegacyEvents = (): EventPost[] => { if (typeof window === "undefined") return defaultEvents; try { return JSON.parse(localStorage.getItem("uksein_events") || "null") || defaultEvents; } catch { return defaultEvents; } };
export const saveEvents = (events: EventPost[]) => localStorage.setItem("uksein_events", JSON.stringify(events));

const translateValue = (value: unknown): any => typeof value === "string" ? myanmar[value] ?? value : Array.isArray(value) ? value.map(translateValue) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translateValue(item)])) : value;
export const defaultContentForLanguage = (language: Language): StoreContent => language === "my" ? translateValue(defaultContent) : defaultContent;
export function readContent(language: Language = "en"): StoreContent {
  const shared = publicData<StoreContent>("content_" + language);
  if (shared) return shared;
  const defaults = defaultContentForLanguage(language);
  if (typeof window === "undefined") return defaults;
  const legacy = readLegacyContent();
  // Preserve pre-switcher edits in the language they were written in.
  const legacyLanguage = textLanguage(JSON.stringify(legacy)) === "my" ? "my" : "en";
  let saved: Partial<StoreContent> = {};
  try { saved = JSON.parse(localStorage.getItem("uksein_content_" + language) || "null") ?? (legacyLanguage === language ? (language === "my" ? translateValue(legacy) : legacy) : {}); } catch {}
  return { ...defaults, ...saved, home: { ...defaults.home, ...saved.home, heroImages: legacy.home.heroImages }, about: { ...defaults.about, ...saved.about }, events: { ...defaults.events, ...saved.events } };
}
export function saveContent(content: StoreContent, language: Language = "en") {
  localStorage.setItem("uksein_content_" + language, JSON.stringify(content));
  const legacy = readLegacyContent();
  localStorage.setItem("uksein_content", JSON.stringify({ ...legacy, home: { ...legacy.home, heroImages: content.home.heroImages } }));
}
export function readEvents(language: Language = "en"): EventPost[] {
  const events = publicData<EventPost[]>("events") ?? readLegacyEvents();
  return language === "my" ? translateValue(events) : events;
}
