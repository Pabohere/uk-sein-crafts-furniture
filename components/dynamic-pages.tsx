"use client";
import { useLanguage } from "@/components/language-provider";
import Link from "next/link";
import { textLanguage } from "@/lib/typography";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Cards, Footer, Header, HomeContactSection } from "@/components/store-shell";
import { defaultContent, defaultEvents, readContent, readEvents, type EventPost, type StoreContent } from "@/lib/store-content";
export function HomeContent() {
  const { language, version, t } = useLanguage();
  const [content, setContent] = useState<StoreContent>(defaultContent);
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const refresh = () => setContent(readContent(language));
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [language, version]);
  const home = content.home;
  const images = home.heroImages.filter(Boolean);
  useEffect(() => {
    setSlide(0);
    if (images.length < 2) return;
    const timer = window.setInterval(() => setSlide(current => (current + 1) % images.length), 4800);
    return () => window.clearInterval(timer);
  }, [images.length]);
  return <main>
    <Header />
    <section className="hero motion-in">
      <div className="hero-copy">
        <p className="eyebrow"><span className="glass-status-dot" aria-hidden="true" />{home.eyebrow}</p>
        <h1 lang={textLanguage(home.title, home.accent)}>{home.title}<br /><em>{home.accent}</em></h1>
        <p className="intro">{home.intro}</p>
        <div className="hero-actions">
          <Link className="gold-button" href="/collection">{home.cta}<ArrowRight size={18} /></Link>
          <Link className="glass-secondary" href="/about">{t("About us")}<ArrowRight size={16} /></Link>
        </div>
        <div className="hero-benefits"><span>{t("Handcrafted locally")}</span><span>{t("Nationwide deliveries")}</span></div>
      </div>
      <div className="hero-image" aria-label="Showroom gallery">
        {images.map((image, index) => <img className={index === slide ? "active" : ""} src={image} alt="Uk Sein furniture showroom" key={image} />)}
        {images.length > 1 && <div className="hero-dots" aria-label={t("Showroom")}>
          {images.map((_, index) => <button type="button" aria-label={`Show image ${index + 1}`} aria-pressed={index === slide} className={index === slide ? "active" : ""} onClick={() => setSlide(index)} key={index} />)}
        </div>}
      </div>
    </section>
    <section className="shop">
      <div className="section-head"><div><p className="eyebrow">{home.collectionEyebrow}</p><h2 lang={textLanguage(home.collectionHeading)}>{home.collectionHeading}</h2></div><Link className="text-link" href="/collection">{t("View all")}<ArrowRight size={17} /></Link></div>
      <Cards />
    </section>
    <HomeContactSection contact={content.contact} />
    <Footer />
  </main>;
}
export function AboutContent() { const { language, version } = useLanguage(); const [content, setContent] = useState<StoreContent>(defaultContent); useEffect(() => setContent(readContent(language)), [language, version]); const about = content.about; const values = [["01", about.value1Title, about.value1Text], ["02", about.value2Title, about.value2Text], ["03", about.value3Title, about.value3Text]]; return <main><Header /><PageHeader page="about" eyebrow={about.eyebrow} title={<span lang={textLanguage(about.title, about.accent)}>{about.title}<br /><em>{about.accent}</em></span>} intro={about.intro} /><section className="values">{values.map(([number, title, text]) => <div key={number}><b>{number}</b><h2 lang={textLanguage(title)}>{title}</h2><p>{text}</p></div>)}</section><Footer /></main>; }
export function EventsContent() {
  const { language, version, t } = useLanguage();
  const [content, setContent] = useState<StoreContent>(defaultContent);
  const [events, setEvents] = useState<EventPost[]>(defaultEvents);
  useEffect(() => {
    const refresh = () => { setContent(readContent(language)); setEvents(readEvents(language)); };
    refresh(); window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [language, version]);
  return <main><Header /><PageHeader page="events" eyebrow={content.events.eyebrow} title={<span lang={textLanguage(content.events.title)}>{content.events.title}</span>} intro={content.events.intro} />
    <section className="events-grid">{events.map(event => <article key={event.id}>
      <Link href={`/events/${encodeURIComponent(event.id)}`} aria-label={event.title}><img src={event.image} alt={event.title} /></Link>
      <p>{t(event.kind === "blog" ? "Blog" : "Event")} · {event.date}</p>
      <h2 lang={textLanguage(event.title)}>{event.title}</h2>
      {event.content && <div className="post-excerpt" lang={textLanguage(event.content)}>{event.content.slice(0, 180)}{event.content.length > 180 ? "…" : ""}</div>}
      <Link className="post-read-more" href={`/events/${encodeURIComponent(event.id)}`}>{event.kind === "blog" ? t("Read more") : event.button || t("Read more")}</Link>
    </article>)}</section><Footer /></main>;
}
export function EventArticle({ id }: { id: string }) {
  const { language, version, t } = useLanguage();
  const [post, setPost] = useState<EventPost | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const refresh = () => { setPost(readEvents(language).find(item => item.id === id) || null); setLoaded(true); };
    refresh(); window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [id, language, version]);
  return <main><Header /><PageHeader page="events" eyebrow={t(post?.kind === "blog" ? "Blog" : "Event")} title={t("Events & blogs")} compact /><article className="blog-article">
    <Link className="text-link" href="/events">← {t("Back to events & blogs")}</Link>
    {!post ? <h1>{t(loaded ? "Post not found" : "Loading post…")}</h1> : <>
      <p className="eyebrow">{t(post.kind === "blog" ? "Blog" : "Event")} · {post.date}</p>
      <h1 lang={textLanguage(post.title)}>{post.title}</h1>
      <img className="blog-cover" src={post.image} alt={post.title} />
      <div className="blog-content" lang={textLanguage(post.content || "")}>{post.details?.length ? post.details.map((item, index) => item.type === "image" ? <figure key={index}><img src={item.src} alt={item.alt || post.title} loading="lazy" />{item.alt && <figcaption>{item.alt}</figcaption>}</figure> : item.text.split(/\n\s*\n/).filter(Boolean).map((paragraph, i) => <p key={`${index}-${i}`}>{paragraph}</p>)) : (post.content || "").split(/\n\s*\n/).filter(Boolean).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div>
      <div className="blog-gallery">{(post.images || []).map((image, i) => <img key={i} src={image} alt={`${post.title} — ${i + 1}`} loading="lazy" />)}</div>
    </>}
  </article><Footer /></main>;
}
