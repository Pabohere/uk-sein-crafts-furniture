"use client";

import { useLanguage, LanguageSwitcher } from "@/components/language-provider";
import Link from "next/link";
import { useStoreContent } from "@/components/use-store-content";
import { defaultContact } from "@/lib/store-content";
import { MapPin, Clock } from "lucide-react";
import { textLanguage } from "@/lib/typography";
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

export function HomeContactSection({ contact: suppliedContact }: { contact?: Partial<import("@/lib/store-content").ContactContent> }) {
  const { t } = useLanguage();
  const contact = { ...defaultContact, ...suppliedContact };
  const query = encodeURIComponent(contact.mapQuery.trim() || contact.address);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const phoneLink = (phone: string) => `tel:${phone.replace(/[^+0-9]/g, "")}`;
  return <section className="home-contact" aria-labelledby="home-contact-title">
    <div className="home-contact-heading"><p className="eyebrow">{contact.eyebrow || t("GET IN TOUCH")}</p><h2 id="home-contact-title" lang={textLanguage(contact.title)}>{contact.title || t("Contact Us")}</h2><p lang={textLanguage(contact.intro)}>{contact.intro}</p></div>
    <div className="home-contact-grid">
      <div className="home-contact-card home-contact-details"><p className="eyebrow">{t("Contact")}</p><h3>{t("Get in touch")}</h3>
        {contact.phone && <a className="contact-row" href={phoneLink(contact.phone)}><Phone size={22} /><span><b>{t("Call us")}</b><small>{contact.phone}</small></span><ArrowRight size={18} /></a>}
        {contact.secondaryPhone && <a className="contact-row" href={phoneLink(contact.secondaryPhone)}><Phone size={22} /><span><b>{t("Contact")}</b><small>{contact.secondaryPhone}</small></span><ArrowRight size={18} /></a>}
        {contact.email && <a className="contact-row" href={`mailto:${contact.email}`}><Mail size={22} /><span><b>{t("Email us")}</b><small>{contact.email}</small></span><ArrowRight size={18} /></a>}
      </div>
      <div className="home-contact-card home-contact-showroom"><p className="eyebrow">{t("Showroom")}</p><h3 lang={textLanguage(contact.showroomName)}>{contact.showroomName}</h3><p lang={textLanguage(contact.address)}>{contact.address}</p>
        {contact.openingHours && <p className="showroom-hours"><Clock size={18} /><span lang={textLanguage(contact.openingHours)}>{contact.openingHours}</span></p>}
        <a className="gold-button" href={mapsUrl} target="_blank" rel="noopener noreferrer">{t("Open in Google Maps")}<ArrowRight size={18} /></a>
      </div>
    </div>
    <div className="home-contact-map"><iframe title={`${contact.showroomName} — Google Maps`} src={`https://www.google.com/maps?q=${query}&output=embed`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
  </section>;
}

export function ContactDrawer() {
  const { t } = useLanguage();
  const content = useStoreContent();
  const contact = content.contact || defaultContact;
  const query = encodeURIComponent(contact.mapQuery.trim() || contact.address);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const phoneLink = (phone: string) => `tel:${phone.replace(/[^+0-9]/g, "")}`;
  return <main className="contact-page">
    <Header />
    <PageHeader page="contact" eyebrow={contact.eyebrow} title={<span lang={textLanguage(contact.title)}>{contact.title}</span>} intro={contact.intro} />
    <section className="contact-information">
      <div className="contact-info-card"><p className="eyebrow">{t("GET IN TOUCH")}</p><h2>{t("Contact Us")}</h2>
        {contact.phone && <a className="contact-row" href={phoneLink(contact.phone)}><Phone size={24} /><span><b>{t("Call us")}</b><small>{contact.phone}</small></span><ArrowRight size={18} /></a>}
        {contact.secondaryPhone && <a className="contact-row" href={phoneLink(contact.secondaryPhone)}><Phone size={24} /><span><b>{t("Contact")}</b><small>{contact.secondaryPhone}</small></span><ArrowRight size={18} /></a>}
        {contact.email && <a className="contact-row" href={`mailto:${contact.email}`}><Mail size={24} /><span><b>{t("Email us")}</b><small>{contact.email}</small></span><ArrowRight size={18} /></a>}
      </div>
      <div className="contact-info-card showroom-info"><p className="eyebrow">{t("YANGON · MYANMAR")}</p><h2>{t("Showroom")}</h2><MapPin size={28} /><h3 lang={textLanguage(contact.showroomName)}>{contact.showroomName}</h3><p lang={textLanguage(contact.address)}>{contact.address}</p>
        {contact.openingHours && <p className="showroom-hours"><Clock size={18} /><span lang={textLanguage(contact.openingHours)}>{contact.openingHours}</span></p>}
        <a className="gold-button" href={mapsUrl} target="_blank" rel="noopener noreferrer">{t("Open in Google Maps")}<ArrowRight size={18} /></a>
      </div>
    </section>
    <section className="showroom-map" aria-label={t("Showroom map")}>
      <div className="map-heading"><div><p className="eyebrow">{t("Showroom")}</p><h2 lang={textLanguage(contact.showroomName)}>{contact.showroomName}</h2><p lang={textLanguage(contact.address)}>{contact.address}</p></div><a className="glass-map-link" href={mapsUrl} target="_blank" rel="noopener noreferrer">{t("Open in Google Maps")}<ArrowRight size={17} /></a></div>
      <iframe title={`${contact.showroomName} — Google Maps`} src={`https://www.google.com/maps?q=${query}&output=embed`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
    </section>
    <Footer />
  </main>;
}

export function Footer() {
  const { language, t } = useLanguage();
  const content = useStoreContent();
  const contact = content.contact || defaultContact;
  return <footer><div className="footer-content"><div className="footer-brand"><BrandLogo footer /></div><div><h3>{t("Showroom")}</h3><p lang={textLanguage(contact.address)}>{contact.address}</p></div><div><h3>{t("Contact")}</h3><p>{contact.phone}{contact.secondaryPhone && <><br />{contact.secondaryPhone}</>}</p></div></div></footer>;
}
