"use client";
import { Suspense } from "react";
import { useLanguage } from "@/components/language-provider";
import { Footer, Header } from "@/components/store-shell";
import { PageHeader } from "@/components/page-header";
import CollectionCatalog from "@/components/collection-catalog";

export default function Collection() {
  const { t } = useLanguage();
  return (
    <main>
      <Header />
      <PageHeader page="collection" eyebrow={t("SHOP ALL")} title={t("The collection")} intro={t("Handmade pieces designed for warm, considered living.")} />
      <section className="shop"><Suspense fallback={<p>{t("The collection")}</p>}><CollectionCatalog /></Suspense></section>
      <Footer />
    </main>
  );
}
