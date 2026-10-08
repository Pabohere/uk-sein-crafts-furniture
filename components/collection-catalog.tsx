"use client";

import { useLanguage } from "@/components/language-provider";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { defaultCatalog, readCatalog, type CatalogProduct } from "@/lib/catalog";

const slugFor = (name: string) => name.toLowerCase().replaceAll(" ", "-");

export default function CollectionCatalog() {
  const { language, t } = useLanguage();
  const [filter, setFilter] = useState("All");
  const [catalog, setCatalog] = useState<CatalogProduct[]>(defaultCatalog);
  const searchParams = useSearchParams();
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  useEffect(() => { const refresh = () => setCatalog(readCatalog()); refresh(); window.addEventListener("storage", refresh); return () => window.removeEventListener("storage", refresh); }, []);
  const categories = ["All", ...Array.from(new Set(catalog.map((product) => product.category)))];
  const visibleProducts = catalog.filter((product) => (filter === "All" || product.category === filter) && (!search || `${(language === "my" && product.nameMy ? product.nameMy : t(product.name))} ${t(product.category)} ${product.description} ${(language === "my" && product.nameMy ? product.nameMy : t(product.name))} ${t(product.category)} ${(language === "my" && product.descriptionMy ? product.descriptionMy : t(product.description))} ${product.price}`.toLowerCase().includes(search)));

  return (
    <>
      <div className="collection-tools" aria-label={t("Product categories")}>
        {categories.map((key) => (
          <button
            key={key}
            type="button"
            className={filter === key ? "active" : ""}
            onClick={() => setFilter(key)}
          >
            {t(key === "All" ? "All products" : key)}
          </button>
        ))}
      </div>
      {search && <p className="search-results">{t("Search results for")} <b>“{searchParams.get("search")}”</b> · {visibleProducts.length} {t("found")}</p>}
      <div className="product-grid">
        {visibleProducts.map((product) => (
          <Link
            className="product motion-card product-link"
            href={`/collection/${product.id}`}
            key={product.id}
          >
            <div className="product-image">
              <span>{t("NEW")}</span>
              <img src={product.image} alt={(language === "my" && product.nameMy ? product.nameMy : t(product.name))} />
            </div>
            <div className="product-meta">
              <small>{t(product.category)}</small>
              <b>{product.price}</b>
            </div>
            <h3>{(language === "my" && product.nameMy ? product.nameMy : t(product.name))}</h3>
            <div className="sizes" aria-label={t("Available sizes")}>
              {product.sizes.map((size) => <span className={size === "M" ? "selected" : ""} key={size}>{size}</span>)}
            </div>
            <span className="add">{t("View details")}&nbsp; +</span>
          </Link>
        ))}
      </div>
      {!visibleProducts.length && <p className="search-empty">{t("No products found. Try another search term.")}</p>}
    </>
  );
}
