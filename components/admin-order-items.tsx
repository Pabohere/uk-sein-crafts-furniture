import type { CatalogProduct } from "@/lib/catalog";
import type { StoreOrder } from "@/lib/cart";
export function AdminOrderItems({ order, catalog }: { order: StoreOrder; catalog: CatalogProduct[] }) {
  const items = order.items || order.item.split(/,\s*/).map((text, index) => {
    const product = catalog.find(product => text === product.name || text.startsWith(product.name + " ·") || text.startsWith(product.name + " ×"));
    return { productId: product?.id || String(index), name: text, image: product?.image || (index === 0 ? order.image : ""), size: "", quantity: 0, price: "" };
  });
  return <div className="admin-order-items">{items.map((item, index) => <article key={`${item.productId}-${item.size}-${index}`}>{item.image ? <img src={item.image} alt={item.name} /> : <span className="order-image-placeholder">No image</span>}<div><b>{item.name}</b>{item.quantity > 0 && <small>{item.size && `Size ${item.size} · `}Quantity {item.quantity}</small>}{item.price && <small>{item.price}</small>}</div></article>)}</div>;
}
