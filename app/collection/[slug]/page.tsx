"use client";
import { useLanguage } from "@/components/language-provider";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer, Header } from "@/components/store-shell";
import { defaultCatalog, readCatalog, type CatalogProduct } from "@/lib/catalog";

const slugFor = (name: string) => name.toLowerCase().replaceAll(" ", "-");
export default function ProductDetail() {
  const { language, t } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const [catalog, setCatalog] = useState<CatalogProduct[]>(defaultCatalog);
  useEffect(() => { const refresh = () => setCatalog(readCatalog()); refresh(); window.addEventListener("storage", refresh); return () => window.removeEventListener("storage", refresh); }, []);
  const safeSlug = decodeURIComponent(String(slug));
  const product = catalog.find((item) => item.id === safeSlug || slugFor(item.name) === safeSlug);
  if (!product) return <main><Header /><section className="detail"><div><Link className="back-link" href="/collection">{t("← Back to collection")}</Link><h1>{t("Product not found")}</h1></div></section><Footer /></main>;
  return <main><Header /><section className="detail motion-in"><img src={product.image} alt={(language === "my" && product.nameMy ? product.nameMy : t(product.name))} /><div><Link className="back-link" href="/collection">{t("← Back to collection")}</Link><p className="eyebrow">{t(product.category)}</p><h1>{(language === "my" && product.nameMy ? product.nameMy : t(product.name))}</h1><b>{product.price}</b><p>{(language === "my" && product.descriptionMy ? product.descriptionMy : t(product.description))}</p><div className="sizes">{product.sizes.map((size) => <span className={size === "M" ? "selected" : ""} key={size}>{size}</span>)}</div><button className="gold-button" type="button">{t("Add to basket")}&nbsp; +</button></div></section><Footer /></main>;
}
