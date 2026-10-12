import { publicData } from "./public-data";
import { products as initialProducts } from "@/lib/products";

export type StockStatus = "in_stock" | "out_of_stock" | "preorder";
export const stockLabel = (status?: StockStatus) => status === "out_of_stock" ? "Out of stock" : status === "preorder" ? "Preorder" : "In stock";

export type CatalogProduct = { id: string; name: string; nameMy?: string; descriptionMy?: string; category: string; price: string; sizes: string[]; image: string; description: string; stockStatus?: StockStatus; images?: string[] };
const demoGallery = [
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=80",
];
export const defaultCatalog: CatalogProduct[] = initialProducts.map((product, index) => ({ id: `product-${index + 1}`, name: product.n, category: product.c, price: product.p, stockStatus: "in_stock", sizes: ["S", "M", "L"], image: product.i, images: demoGallery.filter(image => image !== product.i).slice(0, [0, 2, 4][index % 3]), description: "A handcrafted piece made to bring natural texture and a calm, lived-in feeling to your home." }));
const catalogSeedVersion = "2026-10-100-products";
const catalogKey = "uksein_catalog";
const seedVersionKey = "uksein_catalog_seed_version";
export const seedProductImages = (item: CatalogProduct): CatalogProduct => {
  const seed = defaultCatalog.find(product => product.id === item.id && product.name === item.name && product.image === item.image);
  return seed && item.images === undefined ? { ...item, images: seed.images } : item;
};
const ensureDescription = (item: CatalogProduct): CatalogProduct => ({ ...seedProductImages(item), description: item.description || "A handcrafted piece made to bring natural texture and a calm, lived-in feeling to your home." });

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
