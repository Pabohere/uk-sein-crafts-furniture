"use client";
import { Pencil, Trash2 } from 'lucide-react';
import type { CatalogProduct } from '@/lib/catalog';
export function AdminCategoryList({ categories, catalog, edit, remove }: { categories: string[]; catalog: CatalogProduct[]; edit: (name: string) => void; remove: (name: string) => void }) {
  return <section className="admin-category-list"><div className="category-list-heading"><h2>Category list</h2><span>{categories.length} categories</span></div><div className="category-table-scroll"><table><thead><tr><th scope="col">Category</th><th scope="col">Products</th><th scope="col">Product preview</th><th scope="col">Actions</th></tr></thead><tbody>{categories.map(category => {
    const products = catalog.filter(product => product.category === category);
    return <tr key={category}><td><b>{category}</b></td><td><span className="category-product-count">{products.length}</span></td><td className="category-product-preview">{products.slice(0, 3).map(product => product.name).join(', ') || 'No products yet'}{products.length > 3 && ` +${products.length - 3} more`}</td><td><div className="category-list-actions"><button type="button" aria-label={`Edit category: ${category}`} onClick={() => edit(category)}><Pencil size={15} /> Edit</button><button type="button" aria-label={`Delete category: ${category}`} onClick={() => remove(category)}><Trash2 size={15} /> Delete</button></div></td></tr>;
  })}</tbody></table></div>{categories.length === 0 && <p className="category-list-empty">No categories match your filters.</p>}</section>;
}
