import { stockLabel, type CatalogProduct } from './catalog';
import type { StoreOrder } from './cart';
export type ProductFilters = { query: string; category: string; stock: string; size: string };
export type CategoryFilters = { query: string; usage: string };
export type OrderFilters = { query: string; status: string };
const searchable = (value: string) => value.normalize('NFKC').toLowerCase();
const matches = (query: string, values: string[]) => {
  const text = searchable(values.join(' '));
  return searchable(query.trim()).split(/\s+/).filter(Boolean).every(word => text.includes(word));
};
export const filterProducts = (catalog: CatalogProduct[], filter: ProductFilters) => catalog.filter(product =>
  (!filter.category || product.category === filter.category) && (!filter.stock || (product.stockStatus || 'in_stock') === filter.stock) && (!filter.size || product.sizes.includes(filter.size)) &&
  matches(filter.query, [product.id, product.name, product.nameMy || '', product.description, product.descriptionMy || '', product.category, product.price, product.price.replace(/\D/g, ''), stockLabel(product.stockStatus), ...product.sizes]));
export const filterCategories = (categories: string[], catalog: CatalogProduct[], filter: CategoryFilters) => categories.filter(category => {
  const products = catalog.filter(product => product.category === category);
  return (!filter.usage || (filter.usage === 'used' ? products.length > 0 : products.length === 0)) && matches(filter.query, [category, ...products.flatMap(product => [product.name, product.nameMy || ''])]);
});
export const filterOrders = (orders: StoreOrder[], filter: OrderFilters) => orders.filter(order => {
  const digits = filter.query.replace(/\D/g, '');
  const phoneMatch = digits.length > 0 && /^[+\d\s()-]+$/.test(filter.query.trim()) && order.phone.replace(/\D/g, '').includes(digits);
  return (!filter.status || order.status === filter.status) && (phoneMatch || matches(filter.query, [order.id, order.customer, order.phone, order.address, order.item, order.total, order.total.replace(/\D/g, ''), order.status, ...(order.items || []).flatMap(item => [item.name, item.size, item.productId])]));
});
