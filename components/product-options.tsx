"use client";
import { useLanguage } from "@/components/language-provider";
import { stockLabel, type CatalogProduct } from "@/lib/catalog";
export function ProductOptions({ product, selectedSize, onSelectSize, disabled = false }: { product: CatalogProduct; selectedSize?: string; onSelectSize?: (size: string) => void; disabled?: boolean }) {
  const { t } = useLanguage();
  const sizeOrder = ["S", "M", "L"];
  const sizes = [...new Set(product.sizes)].sort((a, b) => (sizeOrder.indexOf(a) < 0 ? 99 : sizeOrder.indexOf(a)) - (sizeOrder.indexOf(b) < 0 ? 99 : sizeOrder.indexOf(b)));
  return <div className="product-options">
    <span className={`stock-badge stock-${product.stockStatus || "in_stock"}`}>{t(stockLabel(product.stockStatus))}</span>
    {product.sizes.length > 0 && <div className="available-size-list" aria-label={t("Available sizes")}><span className="size-list-label">{t("Sizes")}</span><ul role={onSelectSize ? "radiogroup" : undefined} aria-label={onSelectSize ? t("Choose size") : undefined}>{sizes.map(size => <li key={size}>{onSelectSize ? <button type="button" role="radio" aria-checked={selectedSize === size} className={selectedSize === size ? "selected" : ""} disabled={disabled} onClick={() => onSelectSize(size)}>{size}</button> : size}</li>)}</ul></div>}
  </div>;
}
