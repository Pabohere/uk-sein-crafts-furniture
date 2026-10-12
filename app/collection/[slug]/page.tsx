"use client";
import { useLanguage } from "@/components/language-provider";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ProductGallery } from "@/components/product-gallery";
import { ProductOptions } from "@/components/product-options";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer, Header } from "@/components/store-shell";
import { defaultCatalog, readCatalog, type CatalogProduct } from "@/lib/catalog";
import { addToCart } from "@/lib/cart";

const slugFor = (name: string) => name.toLowerCase().replaceAll(" ", "-");
export default function ProductDetail() {
  const { language, t } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const [sizeChoice, setSizeChoice] = useState<{ productId: string; size: string } | null>(null);
  const [cartError, setCartError] = useState("");
  const [catalog, setCatalog] = useState<CatalogProduct[]>(defaultCatalog);
  useEffect(() => { const refresh = () => setCatalog(readCatalog()); refresh(); window.addEventListener("storage", refresh); return () => window.removeEventListener("storage", refresh); }, []);
  const safeSlug = decodeURIComponent(String(slug));
  const product = catalog.find((item) => item.id === safeSlug || slugFor(item.name) === safeSlug);
  const selectedSize = product && sizeChoice?.productId === product.id && product.sizes.includes(sizeChoice.size) ? sizeChoice.size : "";
  if (!product) return <main><Header /><section className="detail"><div><Link className="back-link" href="/collection">{t("← Back to collection")}</Link><h1>{t("Product not found")}</h1></div></section><Footer /></main>;
  return <main><Header /><PageHeader page="collection" eyebrow={t(product.category)} title={t("The collection")} compact /><section className="detail motion-in"><ProductGallery key={product.id} images={[product.image, ...(product.images || [])]} name={language === "my" && product.nameMy ? product.nameMy : t(product.name)} /><div><Link className="back-link" href="/collection">{t("← Back to collection")}</Link><p className="eyebrow">{t(product.category)}</p><h1>{(language === "my" && product.nameMy ? product.nameMy : t(product.name))}</h1><b>{product.price}</b><p>{(language === "my" && product.descriptionMy ? product.descriptionMy : t(product.description))}</p><ProductOptions product={product} selectedSize={selectedSize} onSelectSize={size => { setSizeChoice({ productId: product.id, size }); setCartError(""); }} disabled={product.stockStatus === "out_of_stock"} />{product.sizes.length > 0 && !selectedSize && product.stockStatus !== "out_of_stock" && <p className="choose-size-note">{t("Choose a size before adding to cart.")}</p>}{cartError && <p role="alert">{cartError}</p>}<button className="gold-button" type="button" disabled={product.stockStatus === "out_of_stock" || (product.sizes.length > 0 && !selectedSize)} onClick={() => { try { addToCart(product, selectedSize || undefined); } catch (error) { setCartError(error instanceof Error ? error.message : t("Unable to add product to cart.")); } }}>{t(product.stockStatus === "out_of_stock" ? "Out of stock" : product.stockStatus === "preorder" ? "Preorder" : "Add to cart")}&nbsp; {product.stockStatus === "out_of_stock" ? "" : "+"}</button></div></section><Footer /></main>;
}
