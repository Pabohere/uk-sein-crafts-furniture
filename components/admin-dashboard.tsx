"use client";

import { ArrowUpRight, CircleDollarSign, ClipboardList, PackageCheck, Tags, Users } from "lucide-react";

type Order = { id: string; customer: string; item: string; total: string; status: string };

const amount = (value: string) => Number(value.replace(/[^0-9]/g, "")) || 0;
const formatMMK = (value: number) => `${new Intl.NumberFormat("en-US").format(value)} MMK`;

export function AdminDashboard({ orders, products, categories, events, openOrders, openProducts }: {
  orders: Order[]; products: number; categories: number; events: number; openOrders: () => void; openProducts: () => void;
}) {
  const revenue = orders.reduce((total, order) => total + amount(order.total), 0);
  const customers = new Set(orders.map((order) => order.customer.trim().toLowerCase()).filter(Boolean)).size;
  const awaitingPayment = orders.filter((order) => order.status === "Pending payment").length;
  const inProgress = orders.filter((order) => ["Confirmed", "Ready for delivery"].includes(order.status)).length;
  const completed = orders.filter((order) => order.status === "Completed").length;
  const topOrder = [...orders].sort((a, b) => amount(b.total) - amount(a.total))[0];

  return <>
    <div className="dashboard-heading"><div><p className="eyebrow">ECOMMERCE OVERVIEW</p><h1>Store performance</h1><p>Monitor sales, customers, orders and catalog activity in one place.</p></div><button className="gold-button" type="button" onClick={openProducts}><PackageCheck size={17} /> Add product</button></div>
    <div className="commerce-stats">
      <article><span className="metric-icon"><CircleDollarSign size={19} /></span><small>Gross sales</small><b>{formatMMK(revenue)}</b><em>All recorded orders</em></article>
      <article><span className="metric-icon"><ClipboardList size={19} /></span><small>Orders</small><b>{orders.length}</b><em>{awaitingPayment} awaiting payment</em></article>
      <article><span className="metric-icon"><Users size={19} /></span><small>Customers</small><b>{customers}</b><em>{orders.length ? `${formatMMK(Math.round(revenue / orders.length))} average order` : "No orders yet"}</em></article>
      <article><span className="metric-icon"><PackageCheck size={19} /></span><small>Published products</small><b>{products}</b><em>{categories} active categories</em></article>
    </div>
    <div className="dashboard-grid">
      <section className="dashboard-panel order-status-panel"><div className="panel-heading"><div><p className="eyebrow">FULFILMENT</p><h2>Order status</h2></div><button type="button" onClick={openOrders}>View orders <ArrowUpRight size={16} /></button></div><div className="status-summary"><div><span className="status-dot pending" />Awaiting payment <b>{awaitingPayment}</b></div><div><span className="status-dot processing" />In progress <b>{inProgress}</b></div><div><span className="status-dot complete" />Completed <b>{completed}</b></div></div><p className="panel-note">Update an order’s status as payment, packing and delivery progress.</p></section>
      <section className="dashboard-panel catalog-panel"><div className="panel-heading"><div><p className="eyebrow">CATALOG HEALTH</p><h2>Store content</h2></div><Tags size={20} /></div><div className="catalog-health"><div><b>{products}</b><span>Products ready to sell</span></div><div><b>{categories}</b><span>Categories for discovery</span></div><div><b>{events}</b><span>Events & blog posts</span></div></div><button className="panel-link" type="button" onClick={openProducts}>Manage product catalog <ArrowUpRight size={16} /></button></section>
    </div>
    <section className="dashboard-panel recent-orders-panel"><div className="panel-heading"><div><p className="eyebrow">SALES ACTIVITY</p><h2>Recent orders</h2></div><button type="button" onClick={openOrders}>All orders <ArrowUpRight size={16} /></button></div>{orders.length ? <div className="dashboard-order-list">{orders.slice(0, 5).map((order) => <button type="button" key={order.id} onClick={openOrders}><span><b>{order.id}</b><small>{order.customer} · {order.item}</small></span><strong>{order.total}</strong><em>{order.status}</em><ArrowUpRight size={17} /></button>)}</div> : <p className="empty-dashboard">Orders will appear here as soon as customers complete checkout.</p>}</section>
    {topOrder && <p className="dashboard-insight"><b>Top order:</b> {topOrder.item} · {topOrder.total}</p>}
  </>;
}
