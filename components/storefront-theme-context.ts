/// <reference types="vite/client" />
"use client";
import { createContext, type Context } from "react";
export type StorefrontThemeState = { mode: "light" | "dark"; toggle: () => void; ready: boolean };
// Keep context identity when Vite reevaluates a module while the root stays mounted.
// A context module also keeps component Fast Refresh separate from createContext.
let context: Context<StorefrontThemeState | null>;
if (import.meta.hot) {
  context = import.meta.hot.data.storefrontThemeContext ?? createContext<StorefrontThemeState | null>(null);
  import.meta.hot.data.storefrontThemeContext = context;
} else {
  context = createContext<StorefrontThemeState | null>(null);
}
export const SiteTheme = context;
