import { LiquidPointer } from "@/components/liquid-pointer";
import { StorefrontThemeProvider } from "@/components/storefront-theme";
import { LanguageProvider } from "@/components/language-provider";
import type { Metadata } from "next";
import "./globals.css";
import "./overrides.css";
import "./admin.css";
import "./routes.css";
import "./commerce.css";
import "./fixes.css";
import "./hero-full-image.css";
import "./product-fixes.css";
import "./logo.css";
import "./navigation-state.css";
import "./carousel-admin.css";
import "./contact-seamless.css";
import "./search.css";
import "./myanmar-typography.css";
import "./product-options.css";
import "./admin-studio.css";
import "./storefront-theme.css";
import "./storefront-polish.css";
import "./liquid-glass.css";
import "./admin-liquid-glass.css";
import "./liquid-pointer.css";

export const metadata: Metadata = {
  title: "Uk Sein Crafts & Furniture | Yangon",
  description: "Handmade rattan furniture and local crafts from Yangon, Myanmar.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased"><LanguageProvider><StorefrontThemeProvider>{children}<LiquidPointer /></StorefrontThemeProvider></LanguageProvider></body>
    </html>
  );
}
import "./home-contact.css";
