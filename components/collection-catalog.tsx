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
  const [page, setPage] = useState(1);
  const [catalog, setCatalog] = useState<CatalogProduct[]>(defaultCatalog);
  const searchParams = useSearchParams();
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  useEffect(() => { const refresh = () => setCatalog(readCatalog()); refresh(); window.addEventListener("storage", refresh); return () => window.removeEventListener("storage", refresh); }, []);
  const categories = ["All", ...Array.from(new Set(catalog.map((product) => product.category)))];
  const visibleProducts = catalog.filter((product) => (filter === "All" || product.category === filter) && (!search || `${(language === "my" && product.nameMy ? product.nameMy : t(product.name))} ${t(product.category)} ${product.description} ${(language === "my" && product.nameMy ? product.nameMy : t(product.name))} ${t(product.category)} ${(language === "my" && product.descriptionMy ? product.descriptionMy : t(product.description))} ${product.price}`.toLowerCase().includes(search)));
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageProducts = visibleProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const chooseFilter = (key: string) => {
    setFilter(key);
    setPage(1);
  };

  const choosePage = (nextPage: number) => {
    setPage(nextPage);
    document.querySelector(".collection-tools")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div className="collection-tools" aria-label={t("Product categories")}>
        {categories.map((key) => (
          <button
            key={key}
            type="button"
            className={filter === key ? "active" : ""}
            onClick={() => chooseFilter(key)}
          >
            {t(key === "All" ? "All products" : key)}
          </button>
        ))}
      </div>
      {search && <p className="search-results">{t("Search results for")} <b>“{searchParams.get("search")}”</b> · {visibleProducts.length} {t("found")}</p>}
      <div className="product-grid">
        {pageProducts.map((product) => (
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
      {visibleProducts.length > pageSize && <nav className="collection-pagination" aria-label="Collection pages">
        <button type="button" onClick={() => choosePage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page">←</button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} type="button" className={number === currentPage ? "active" : ""} aria-current={number === currentPage ? "page" : undefined} onClick={() => choosePage(number)}>{number}</button>)}
        <button type="button" onClick={() => choosePage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page">→</button>
      </nav>}
      {!visibleProducts.length && <p className="search-empty">{t("No products found. Try another search term.")}</p>}
    </>
  );
}
