"use client";
import { useState } from 'react';
import { Search } from 'lucide-react';
import { filterProducts, filterCategories, filterOrders, type ProductFilters, type CategoryFilters, type OrderFilters } from '@/lib/admin-filters';
import { stockLabel, type CatalogProduct } from '@/lib/catalog';
import type { StoreOrder } from '@/lib/cart';
const initialProducts: ProductFilters = { query: '', category: '', stock: '', size: '' };
const initialCategories: CategoryFilters = { query: '', usage: '' };
const initialOrders: OrderFilters = { query: '', status: '' };
export function useAdminSectionFilters(catalog: CatalogProduct[], categories: string[], orders: StoreOrder[]) {
  const [products, setProducts] = useState(initialProducts);
  const [category, setCategory] = useState(initialCategories);
  const [order, setOrder] = useState(initialOrders);
  const filteredProducts = filterProducts(catalog, products), filteredCategories = filterCategories(categories, catalog, category), filteredOrders = filterOrders(orders, order);
  const search = (label: string, query: string, placeholder: string, update: (query: string) => void) => <label className="admin-section-search"><Search size={17} /><input aria-label={label} type="search" value={query} onChange={event => update(event.target.value)} placeholder={placeholder} /></label>;
  const toolbar = (controls: React.ReactNode, count: number, total: number, reset: () => void) => <div className="admin-section-filters">{controls}<button type="button" onClick={reset}>Clear filters</button><p role="status">Showing {count} of {total}</p>{count === 0 && <p className="admin-filter-empty">No matching data. Try another search or clear the filters.</p>}</div>;
  return { filteredProducts, filteredCategories, filteredOrders,
    productToolbar: toolbar(<>{search('Search products', products.query, 'Name, Myanmar name, price, description…', query => setProducts({ ...products, query }))}<label>Category<select aria-label="Filter products by category" value={products.category} onChange={event => setProducts({ ...products, category: event.target.value })}><option value="">All categories</option>{[...new Set([...categories, ...catalog.map(product => product.category)])].map(item => <option key={item}>{item}</option>)}</select></label><label>Stock status<select aria-label="Filter products by stock status" value={products.stock} onChange={event => setProducts({ ...products, stock: event.target.value })}><option value="">All stock statuses</option>{(['in_stock','out_of_stock','preorder'] as const).map(item => <option key={item} value={item}>{stockLabel(item)}</option>)}</select></label><label>Size<select aria-label="Filter products by size" value={products.size} onChange={event => setProducts({ ...products, size: event.target.value })}><option value="">All sizes</option>{[...new Set(catalog.flatMap(product => product.sizes))].sort((a, b) => ['S','M','L'].indexOf(a) - ['S','M','L'].indexOf(b)).map(item => <option key={item}>{item}</option>)}</select></label></>, filteredProducts.length, catalog.length, () => setProducts(initialProducts)),
    categoryToolbar: toolbar(<>{search('Search categories', category.query, 'Category or product name…', query => setCategory({ ...category, query }))}<label>Products<select aria-label="Filter categories by usage" value={category.usage} onChange={event => setCategory({ ...category, usage: event.target.value })}><option value="">All categories</option><option value="used">With products</option><option value="empty">Without products</option></select></label></>, filteredCategories.length, categories.length, () => setCategory(initialCategories)),
    orderToolbar: toolbar(<>{search('Search orders', order.query, 'Order ID, customer, phone, address, item…', query => setOrder({ ...order, query }))}<label>Status<select aria-label="Filter orders by status" value={order.status} onChange={event => setOrder({ ...order, status: event.target.value })}><option value="">All statuses</option>{[...new Set(['Pending payment','Confirmed','Ready for delivery','Completed', ...orders.map(item => item.status)])].map(item => <option key={item}>{item}</option>)}</select></label></>, filteredOrders.length, orders.length, () => setOrder(initialOrders))
  };
}
