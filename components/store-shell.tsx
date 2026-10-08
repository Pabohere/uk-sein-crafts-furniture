"use client";

import { useLanguage, LanguageSwitcher } from "@/components/language-provider";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, BookOpen, CalendarDays, FileText, Mail, Phone, Plus, Search, ShoppingBag } from "lucide-react";
import { products } from "@/lib/products";
import { defaultCatalog, readCatalog, type CatalogProduct } from "@/lib/catalog";

export { products } from "@/lib/products";
const tickerMessages = ["Nationwide deliveries", "Handcrafted locally"];

function BrandLogo({ footer = false }: { footer?: boolean }) {
  return <span className={`brand-logo${footer ? " footer-logo" : ""}`}><img src="/uk-sein-logo-transparent.png" alt="Uk Sein Crafts & Furniture" /></span>;
}

export function Header() {
  const { language, t } = useLanguage();
  const pathname = usePathname();
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
        <button className="bag" type="button" aria-label={t("Shopping bag")}><ShoppingBag size={18} /></button>

      </div>
    </nav>
  </>;
}

export function Cards() {
  const { language, t } = useLanguage();
  const [catalog, setCatalog] = useState<CatalogProduct[]>(defaultCatalog);
  useEffect(() => { const refresh = () => setCatalog(readCatalog()); refresh(); window.addEventListener("storage", refresh); return () => window.removeEventListener("storage", refresh); }, []);
  return <div className="product-grid">{catalog.map((product) => <article className="product motion-card" key={product.id}>
    <div className="product-image"><img src={product.image} alt={(language === "my" && product.nameMy ? product.nameMy : t(product.name))} /><span>{t("NEW")}</span></div>
    <div className="product-meta"><div><p>{t(product.category)}</p><h3>{(language === "my" && product.nameMy ? product.nameMy : t(product.name))}</h3><div className="product-sizes">{product.sizes.map((size) => <button className={size === "M" ? "chosen" : ""} type="button" key={size}>{size}</button>)}</div></div><b>{product.price}</b></div>
    <Link className="add" href={`/collection/${product.id}`}>{t("View details")} <Plus size={17} /></Link>
  </article>)}</div>;
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
