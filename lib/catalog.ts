import { publicData } from "./public-data";
import { products as initialProducts } from "@/lib/products";

export type CatalogProduct = { id: string; name: string; nameMy?: string; descriptionMy?: string; category: string; price: string; sizes: string[]; image: string; description: string };
export const defaultCatalog: CatalogProduct[] = initialProducts.map((product, index) => ({ id: `product-${index + 1}`, name: product.n, category: product.c, price: product.p, sizes: ["S", "M", "L"], image: product.i, description: "A handcrafted piece made to bring natural texture and a calm, lived-in feeling to your home." }));
const catalogSeedVersion = "2026-10-100-products";
const catalogKey = "uksein_catalog";
const seedVersionKey = "uksein_catalog_seed_version";
const ensureDescription = (item: CatalogProduct): CatalogProduct => ({ ...item, description: item.description || "A handcrafted piece made to bring natural texture and a calm, lived-in feeling to your home." });

export const readCatalog = (): CatalogProduct[] => {
  if (typeof window === "undefined") return defaultCatalog;
  const shared = publicData<CatalogProduct[]>("catalog");
  if (shared) return shared.map(ensureDescription);
  try {
    const saved = JSON.parse(localStorage.getItem(catalogKey) || "null") as CatalogProduct[] | null;
    if (!saved) return defaultCatalog;
    if (localStorage.getItem(seedVersionKey) === catalogSeedVersion) return saved.map(ensureDescription);

    // Upgrade previous small demo catalogs without losing any user-edited products.
    const savedByName = new Map(saved.map((item) => [item.name.trim().toLowerCase(), ensureDescription(item)]));
    const seeded = defaultCatalog.map((item) => savedByName.get(item.name.trim().toLowerCase()) ?? item);
    const custom = saved.filter((item) => !defaultCatalog.some((seed) => seed.name.trim().toLowerCase() === item.name.trim().toLowerCase()));
    const upgraded = [...seeded, ...custom];
    localStorage.setItem(catalogKey, JSON.stringify(upgraded));
    localStorage.setItem(seedVersionKey, catalogSeedVersion);
    return upgraded;
  } catch { return defaultCatalog; }
};

export const saveCatalog = (catalog: CatalogProduct[]) => {
  localStorage.setItem(catalogKey, JSON.stringify(catalog));
  localStorage.setItem(seedVersionKey, catalogSeedVersion);
};
