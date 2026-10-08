import { products as initialProducts } from "@/lib/products";

export type CatalogProduct = { id: string; name: string; nameMy?: string; descriptionMy?: string; category: string; price: string; sizes: string[]; image: string; description: string };
export const defaultCatalog: CatalogProduct[] = initialProducts.map((product, index) => ({ id: `product-${index + 1}`, name: product.n, category: product.c, price: product.p, sizes: ["S", "M", "L"], image: product.i, description: "A handcrafted piece made to bring natural texture and a calm, lived-in feeling to your home." }));
export const readCatalog = (): CatalogProduct[] => { if (typeof window === "undefined") return defaultCatalog; try { return (JSON.parse(localStorage.getItem("uksein_catalog") || "null") || defaultCatalog).map((item: CatalogProduct) => ({ ...item, description: item.description || "A handcrafted piece made to bring natural texture and a calm, lived-in feeling to your home." })); } catch { return defaultCatalog; } };
export const saveCatalog = (catalog: CatalogProduct[]) => localStorage.setItem("uksein_catalog", JSON.stringify(catalog));
