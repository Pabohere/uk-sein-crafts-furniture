import { defaultCatalog } from './catalog';
import type { StoreOrder } from './cart';
const names = ['Ma Thiri', 'Ko Htet', 'မအေးအေး', 'Ko Min', 'Ma Su', 'ကိုအောင်', 'Ma May', 'Ko Zaw', 'မနွယ်', 'Ko Thu', 'Ma Hnin', 'ကိုလင်း'];
const places = ['Bahan Township, Yangon', 'Hlaing Township, Yangon', 'Chanayethazan, Mandalay', 'Dagon Township, Yangon', 'Taunggyi', 'Pathein'];
const statuses = ['Pending payment', 'Confirmed', 'Ready for delivery', 'Completed'];
export const demoOrders: StoreOrder[] = names.map((name, index) => {
  const items = Array.from({ length: 1 + index % 3 }, (_, itemIndex) => {
    const product = defaultCatalog[(index * 3 + itemIndex * 35) % defaultCatalog.length];
    return { productId: product.id, name: product.name, size: ['S', 'M', 'L'][(index + itemIndex) % 3], quantity: 1 + (index + itemIndex) % 2, image: product.image, price: product.price };
  });
  const total = items.reduce((sum, item) => sum + Number(item.price.replace(/\D/g, '')) * item.quantity, 0);
  return { id: `DEMO-${1001 + index}`, customer: `${name} (Demo)`, phone: `09 000 000 ${String(index + 1).padStart(3, '0')}`, address: `${places[index % places.length]} (Demo address)`, items, item: items.map(item => `${item.name} · ${item.size} × ${item.quantity}`).join(', '), image: items[0].image, total: `${new Intl.NumberFormat('en-US').format(total)} MMK`, status: statuses[index % statuses.length] };
});
const seedKey = 'uksein_order_demo_version';
const seedVersion = '2026-10-12-demo-orders-v1';
export function readLocalOrders(): StoreOrder[] {
  const saved = JSON.parse(localStorage.getItem('uksein_orders') || '[]') as StoreOrder[];
  if (localStorage.getItem(seedKey) === seedVersion) return saved;
  const ids = new Set(saved.map(order => order.id));
  const next = [...saved, ...demoOrders.filter(order => !ids.has(order.id))];
  localStorage.setItem('uksein_orders', JSON.stringify(next));
  localStorage.setItem(seedKey, seedVersion);
  return next;
}
