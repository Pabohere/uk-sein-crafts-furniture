"use client";
import { Suspense } from "react";
import { useLanguage } from "@/components/language-provider";
import { Footer, Header } from "@/components/store-shell";
import CollectionCatalog from "@/components/collection-catalog";

export default function Collection() {
  const { t } = useLanguage();
  return (
    <main>
      <Header />
      <section className="page-hero motion-in">
        <p className="eyebrow">{t("SHOP ALL")}</p>
        <h1>{t("The collection")}</h1>
        <p>{t("Handmade pieces designed for warm, considered living.")}</p>
      </section>
      <section className="shop"><Suspense fallback={<p>{t("The collection")}</p>}><CollectionCatalog /></Suspense></section>
      <Footer />
    </main>
  );
}
