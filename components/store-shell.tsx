"use client";

import { useLanguage, LanguageSwitcher } from "@/components/language-provider";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, BookOpen, CalendarDays, FileText, Mail, Phone, Plus, Search, ShoppingBag } from "lucide-react";
import { products } from "@/lib/products";
import { defaultCatalog, readCatalog, type CatalogProduct } from "@/lib/catalog";
import { changeCartQuantity, clearCart, readCart, submitOrder, type CartLine } from "@/lib/cart";

export { products } from "@/lib/products";
const tickerMessages = ["Nationwide deliveries", "Handcrafted locally"];

function BrandLogo({ footer = false }: { footer?: boolean }) {
  return <span className={`brand-logo${footer ? " footer-logo" : ""}`}><img src="/uk-sein-logo-transparent.png" alt="Uk Sein Crafts & Furniture" /></span>;
}

export function Header() {
  const { language, t } = useLanguage();
  const pathname = usePathname();
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  useEffect(() => { const refresh = () => setCart(readCart()); const openCart = () => { refresh(); setCartOpen(true); }; refresh(); window.addEventListener("cart-updated", refresh); window.addEventListener("cart-open", openCart); return () => { window.removeEventListener("cart-updated", refresh); window.removeEventListener("cart-open", openCart); }; }, []);
  const links = [["/", "Home"], ["/collection", "Collection"], ["/events", "Events"], ["/about", "About us"], ["/contact", "Contact us"]];
  return <>
    <div className="promo" aria-label={t("Nationwide deliveries and handcrafted locally")}>
      <span className="promo-rotator" aria-hidden="true">
        {Array.from({ length: 20 }, (_, index) => <span key={index}>{t(tickerMessages[index % tickerMessages.length])}</span>)}
      </span>
    </div>
    <nav className="nav">
      <Link className="brand" href="/"><BrandLogo /></Link>
      <div className="nav-links">
        {links.map(([href, label]) => <Link key={href} href={href} className={pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)) ? "active" : ""}>{t(label)}</Link>)}
      </div>
      <div className="nav-actions"><LanguageSwitcher />
        <form className="site-search" role="search" action="/collection"><button type="submit" aria-label={t("Search products")}><Search size={16} /></button><input name="search" aria-label={t("Search products")} placeholder={t("Search products")} /></form>
        <button className="bag" type="button" aria-label={t("Shopping cart")} onClick={() => setCartOpen(true)}><ShoppingBag size={18} />{cart.length > 0 && <i>{cart.reduce((total, item) => total + item.quantity, 0)}</i>}</button>

      </div>
    </nav>{cartOpen && <CartDrawer cart={cart} close={() => setCartOpen(false)} refresh={() => setCart(readCart())} />}
  </>;
}

function CartDrawer({ cart, close, refresh }: { cart: CartLine[]; close: () => void; refresh: () => void }) {
  const [customer, setCustomer] = useState({ customer: "", phone: "", address: "" }); const [checkoutOpen, setCheckoutOpen] = useState(false); const [confirmation, setConfirmation] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const total = cart.reduce((sum, item) => sum + (Number(item.price.replace(/[^0-9]/g, "")) || 0) * item.quantity, 0);
  const checkout = async (event: React.FormEvent) => { event.preventDefault(); setBusy(true); setError(""); try { const order = await submitOrder(customer); setConfirmation(`Order ${order.id} received. We will contact you shortly.`); refresh(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to place your order."); } finally { setBusy(false); } };
  return <div className="cart-dialog-backdrop" role="presentation" onMouseDown={close}><aside className="drawer cart-dialog" aria-label="Shopping cart" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><div className="drawer-top"><h2>{confirmation ? "Order confirmed" : checkoutOpen ? "Checkout" : "Your cart"}</h2><button type="button" onClick={close} aria-label="Close cart">×</button></div>{confirmation ? <div className="order-success"><span>✓</span><h3>Thank you for your order!</h3><p>{confirmation}</p><button className="gold-button" type="button" onClick={close}>Continue shopping</button></div> : cart.length ? <>{!checkoutOpen ? <><div className="cart-list">{cart.map((item) => <article className="cart-item" key={item.id}><img src={item.image} alt="" /><div><h3>{item.name}</h3><p>{item.price}</p><div className="quantity"><button type="button" onClick={() => { changeCartQuantity(item.id, item.quantity - 1); refresh(); }}>−</button><b>{item.quantity}</b><button type="button" onClick={() => { changeCartQuantity(item.id, item.quantity + 1); refresh(); }}>+</button></div></div></article>)}</div><div className="cart-actions"><div><b>Total</b><b>{new Intl.NumberFormat("en-US").format(total)} MMK</b></div><Link className="add-more-products" href="/collection" onClick={close}>← Add more products</Link><button type="button" className="clear-cart" onClick={() => { clearCart(); refresh(); }}>Clear cart</button><button className="gold-button" type="button" onClick={() => setCheckoutOpen(true)}>Proceed to checkout</button></div></> : <form className="checkout" onSubmit={checkout}><div><b>Total</b><b>{new Intl.NumberFormat("en-US").format(total)} MMK</b></div><label>Full name<input required value={customer.customer} onChange={(event) => setCustomer({ ...customer, customer: event.target.value })} /></label><label>Phone number<input required value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} /></label><label>Delivery address<textarea required value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} /></label><div className="checkout-actions"><button type="button" onClick={() => { setCheckoutOpen(false); setError(""); }}>Back to cart</button><button className="gold-button" disabled={busy}>{busy ? "Placing order…" : "Place order"}</button></div>{error && <small className="order-error">{error}</small>}</form>}</> : <p className="empty">Your cart is empty. Add products before checkout.</p>}</aside></div>;
}

export function Cards() {
  const { language, t } = useLanguage();
  const [catalog, setCatalog] = useState<CatalogProduct[]>(defaultCatalog);
  const [page, setPage] = useState(1);
  useEffect(() => { const refresh = () => setCatalog(readCatalog()); refresh(); window.addEventListener("storage", refresh); return () => window.removeEventListener("storage", refresh); }, []);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(catalog.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageProducts = catalog.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const choosePage = (nextPage: number) => {
    setPage(nextPage);
    document.querySelector(".shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return <><div className="product-grid">{pageProducts.map((product) => <article className="product motion-card" key={product.id}>
    <div className="product-image"><img src={product.image} alt={(language === "my" && product.nameMy ? product.nameMy : t(product.name))} /><span>{t("NEW")}</span></div>
    <div className="product-meta"><div><p>{t(product.category)}</p><h3>{(language === "my" && product.nameMy ? product.nameMy : t(product.name))}</h3><div className="product-sizes">{product.sizes.map((size) => <button className={size === "M" ? "chosen" : ""} type="button" key={size}>{size}</button>)}</div></div><b>{product.price}</b></div>
    <Link className="add" href={`/collection/${product.id}`}>{t("View details")} <Plus size={17} /></Link>
  </article>)}</div>{catalog.length > pageSize && <nav className="collection-pagination home-pagination" aria-label={t("Curated pieces pages")}><button type="button" onClick={() => choosePage(currentPage - 1)} disabled={currentPage === 1} aria-label={t("Previous page")}>←</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button type="button" key={number} className={number === currentPage ? "active" : ""} aria-current={number === currentPage ? "page" : undefined} onClick={() => choosePage(number)}>{number}</button>)}<button type="button" onClick={() => choosePage(currentPage + 1)} disabled={currentPage === totalPages} aria-label={t("Next page")}>→</button></nav>}</>;
}

export function ContactDrawer() {
  const { language, t } = useLanguage();
  const rows = [["Call us", "09 771 778 064", Phone], ["Email us", "ukseinmmlocalcrafts@gmail.com", Mail], ["Request a callback", "Select a time", CalendarDays], ["Request a quote", "Discuss your requirements", FileText], ["Product brochure", "Download PDF or view online", BookOpen]];
  return <main className="contact-page"><Header /><section className="contact-layout"><div className="contact-underlay"><section className="page-hero"><p className="eyebrow">{t("GET IN TOUCH")}</p><h1>{t("Contact Uk Sein")}</h1><p>{t("We would love to help you find the right piece for your home.")}</p></section></div><aside className="contact-drawer"><Link className="drawer-close" href="/" aria-label={t("Back to home")}>×</Link><h2>{t("Contact Us")}</h2>{rows.map(([title, sub, Icon]: any) => <button className="contact-row" type="button" key={t(title)}><Icon size={28} /><span><b>{t(title)}</b><small>{t(sub)}</small></span><ArrowRight size={18} /></button>)}</aside></section></main>;
}

export function Footer() {
  const { language, t } = useLanguage();
  return <footer><div className="footer-brand"><BrandLogo footer /></div><div><h3>{t("Showroom")}</h3><p>{t("No. 5, Nawaday Street")}<br />{t("Yangon, Myanmar")}</p></div><div><h3>{t("Contact")}</h3><p>09 771 778 064<br />09 784 058 903</p></div></footer>;
}
