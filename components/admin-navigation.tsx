"use client";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, LayoutDashboard, Package, PanelsTopLeft, ShoppingBag, Tags } from 'lucide-react';
const icons = { overview: LayoutDashboard, products: Package, categories: Tags, orders: ShoppingBag, events: CalendarDays, content: PanelsTopLeft };
export function AdminNavigation({ items, active, orderCount, navigate }: { items: string[][]; active: string; orderCount: number; navigate: (id: string) => void }) {
  return <aside className="admin-navigation"><p className="admin-nav-caption">WORKSPACE</p><div className="admin-nav-links">{items.map(([id, label]) => { const Icon = icons[id as keyof typeof icons] || Package; return <button type="button" key={id} className={active === id ? 'selected' : ''} aria-current={active === id ? 'page' : undefined} onClick={() => navigate(id)}><Icon size={19} /><span>{label}</span>{id === 'orders' && <span className="admin-nav-count">{orderCount}</span>}</button>; })}</div><Link className="admin-store-link" href="/">Visit storefront <ArrowUpRight size={16} /></Link><div className="admin-nav-profile"><span>U</span><div><b>Uk Sein studio</b><small>Store administrator</small></div><span className="admin-profile-dot" /></div></aside>;
}
