"use client";

import { useLanguage, LanguageSwitcher } from "@/components/language-provider";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { StorefrontThemeToggle } from "@/components/storefront-theme";
import { PageHeader } from "@/components/page-header";
import { ProductOptions } from "@/components/product-options";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, BookOpen, CalendarDays, FileText, Mail, Phone, Search, ShoppingBag } from "lucide-react";
import { products } from "@/lib/products";
import { defaultCatalog, readCatalog, type CatalogProduct } from "@/lib/catalog";
import { cartProductId, changeCartSize, changeCartQuantity, clearCart, readCart, submitOrder, type CartLine, type StoreOrder } from "@/lib/cart";

export { products } from "@/lib/products";
const tickerMessages = ["Nationwide deliveries", "Handcrafted locally"];

export function Header() {
  const { language, t } = useLanguage();
  const pathname = usePathname();
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  useEffect(() => { const refresh = () => setCart(readCart()); const openCart = () => { refresh(); setCartOpen(true); }; refresh(); window.addEventListener("cart-updated", refresh); window.addEventListener("cart-open", openCart); return () => { window.removeEventListener("cart-updated", refresh); window.removeEventListener("cart-open", openCart); }; }, []);
  const links = [["/", "Home"], ["/collection", "Collection"], ["/events", "Events & blogs"], ["/about", "About us"], ["/contact", "Contact us"]];
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
      <div className="nav-actions"><StorefrontThemeToggle /><LanguageSwitcher />
        <form className="site-search" role="search" action="/collection"><button type="submit" aria-label={t("Search products")}><Search size={16} /></button><input name="search" aria-label={t("Search products")} placeholder={t("Search products")} /></form>
        <button className="bag" type="button" aria-label={t("Shopping cart")} onClick={() => setCartOpen(true)}><ShoppingBag size={18} />{cart.length > 0 && <i>{cart.reduce((total, item) => total + item.quantity, 0)}</i>}</button>

      </div>
    </nav>{cartOpen && <CartDrawer cart={cart} close={() => setCartOpen(false)} refresh={() => setCart(readCart())} />}
  </>;
}

function CartDrawer({ cart, close, refresh }: { cart: CartLine[]; close: () => void; refresh: () => void }) {
  const { t } = useLanguage();
  const [customer, setCustomer] = useState({ customer: "", phone: "", address: "" }); const [checkoutOpen, setCheckoutOpen] = useState(false); const [confirmation, setConfirmation] = useState<StoreOrder | null>(null); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const catalog = readCatalog();
  const total = cart.reduce((sum, item) => sum + (Number(item.price.replace(/[^0-9]/g, "")) || 0) * item.quantity, 0);
  const checkout = async (event: React.FormEvent) => { event.preventDefault(); setBusy(true); setError(""); try { const order = await submitOrder(customer); setConfirmation(order); refresh(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to place your order."); } finally { setBusy(false); } };
  return <div className="cart-dialog-backdrop" role="presentation" onMouseDown={close}><aside className="drawer cart-dialog" aria-label={t(confirmation ? "Order received" : checkoutOpen ? "Checkout" : "Shopping cart")} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><div className="drawer-top"><h2>{t(confirmation ? "Order received" : checkoutOpen ? "Checkout" : "Your cart")}</h2><button type="button" onClick={close} aria-label={t("Close cart")}>×</button></div>{confirmation ? <div className="order-success"><span>✓</span><h3>{t("Thank you for your order!")}</h3><p>{t("We have received your order. We will call the phone number provided in your order to confirm the details.")}</p><dl className="order-receipt"><div><dt>{t("Order number")}</dt><dd>{confirmation.id}</dd></div><div><dt>{t("Phone number")}</dt><dd>{confirmation.phone}</dd></div></dl><button className="gold-button" type="button" autoFocus onClick={close}>{t("Continue shopping")}</button></div> : cart.length ? <>{!checkoutOpen ? <><div className="cart-list">{cart.map((item) => <article className="cart-item" key={item.id}><img src={item.image} alt="" /><div><h3>{item.name}</h3><p>{item.price}</p>{(catalog.find(product => product.id === cartProductId(item))?.sizes.length || item.size) && <label className="cart-size-label">{t("Size")}<select aria-label={`${t("Size")} — ${item.name}${item.size ? ` · ${item.size}` : ""}`} value={item.size || ""} onChange={event => { try { changeCartSize(item.id, event.target.value); setError(""); refresh(); } catch (error) { setError(error instanceof Error ? error.message : "Unable to change size."); } }}><option value="" disabled>{t("Choose size")}</option>{(catalog.find(product => product.id === cartProductId(item))?.sizes || []).map(size => <option key={size} value={size}>{size}</option>)}</select></label>}<div className="quantity"><button type="button" onClick={() => { changeCartQuantity(item.id, item.quantity - 1); refresh(); }}>−</button><b>{item.quantity}</b><button type="button" onClick={() => { changeCartQuantity(item.id, item.quantity + 1); refresh(); }}>+</button></div></div></article>)}</div><div className="cart-actions"><div><b>Total</b><b>{new Intl.NumberFormat("en-US").format(total)} MMK</b></div><Link className="add-more-products" href="/collection" onClick={close}>← Add more products</Link>{error && <p className="order-error" role="alert">{error}</p>}<button type="button" className="clear-cart" onClick={() => { clearCart(); refresh(); }}>Clear cart</button><button className="gold-button" type="button" onClick={() => setCheckoutOpen(true)}>Proceed to checkout</button></div></> : <form className="checkout" onSubmit={checkout}><div><b>Total</b><b>{new Intl.NumberFormat("en-US").format(total)} MMK</b></div><label>Full name<input required value={customer.customer} onChange={(event) => setCustomer({ ...customer, customer: event.target.value })} /></label><label>Phone number<input required value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} /></label><label>Delivery address<textarea required value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} /></label><div className="checkout-actions"><button type="button" onClick={() => { setCheckoutOpen(false); setError(""); }}>Back to cart</button><button className="gold-button" disabled={busy}>{busy ? "Placing order…" : "Place order"}</button></div>{error && <small className="order-error">{error}</small>}</form>}</> : <p className="empty">Your cart is empty. Add products before checkout.</p>}</aside></div>;
}

export function Cards() {
  const { language, t } = useLanguage();
  const [catalog, setCatalog] = useState<CatalogProduct[]>(defaultCatalog);
  useEffect(() => { const refresh = () => setCatalog(readCatalog()); refresh(); window.addEventListener("storage", refresh); return () => window.removeEventListener("storage", refresh); }, []);
  const pageSize = 10;
  const pageProducts = catalog.slice(0, pageSize);
  return <><div className="product-grid">{pageProducts.map(product => <Link className="product motion-card product-link" href={`/collection/${product.id}`} key={product.id}>
    <div className="product-image"><img src={product.image} alt={language === "my" && product.nameMy ? product.nameMy : t(product.name)} /><span>{t("NEW")}</span></div>
    <div className="product-meta"><small>{t(product.category)}</small><b>{product.price}</b></div>
    <h3>{language === "my" && product.nameMy ? product.nameMy : t(product.name)}</h3><ProductOptions product={product} />
    <span className="add">{t("View details")} +</span>
  </Link>)}</div></>;

}

export function ContactDrawer() {
  const { language, t } = useLanguage();
  const rows = [["Call us", "09 771 778 064", Phone], ["Email us", "ukseinmmlocalcrafts@gmail.com", Mail], ["Request a callback", "Select a time", CalendarDays], ["Request a quote", "Discuss your requirements", FileText], ["Product brochure", "Download PDF or view online", BookOpen]];
  return <main className="contact-page"><Header /><PageHeader page="contact" eyebrow={t("GET IN TOUCH")} title={t("Contact Uk Sein")} intro={t("We would love to help you find the right piece for your home.")} /><section className="contact-layout contact-with-banner"><aside className="contact-drawer"><Link className="drawer-close" href="/" aria-label={t("Back to home")}>×</Link><h2>{t("Contact Us")}</h2>{rows.map(([title, sub, Icon]: any) => <button className="contact-row" type="button" key={t(title)}><Icon size={28} /><span><b>{t(title)}</b><small>{t(sub)}</small></span><ArrowRight size={18} /></button>)}</aside></section></main>;
}

export function Footer() {
  const { language, t } = useLanguage();
  return <footer><div className="footer-content"><div className="footer-brand"><BrandLogo footer /></div><div><h3>{t("Showroom")}</h3><p>{t("No. 5, Nawaday Street")}<br />{t("Yangon, Myanmar")}</p></div><div><h3>{t("Contact")}</h3><p>09 771 778 064<br />09 784 058 903</p></div></div></footer>;
}
