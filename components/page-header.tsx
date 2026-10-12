"use client";
import { useEffect, useState, type ReactNode } from 'react';
import { useLanguage } from '@/components/language-provider';
import { defaultContent, pageHeaderImagesFor, readContent, type PageHeaderKey, type StoreContent } from '@/lib/store-content';
export function PageHeader({ page, eyebrow, title, intro, compact = false }: { page: PageHeaderKey; eyebrow: string; title: ReactNode; intro?: string; compact?: boolean }) {
  const { language, version } = useLanguage();
  const [content, setContent] = useState<StoreContent>(defaultContent);
  const [slide, setSlide] = useState(0);
  useEffect(() => { const refresh = () => setContent(readContent(language)); refresh(); window.addEventListener('storage', refresh); return () => window.removeEventListener('storage', refresh); }, [language, version]);
  const images = pageHeaderImagesFor(content, page);
  const signature = images.join('|');
  useEffect(() => {
    if (images.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setSlide(current => (current + 1) % images.length), 4800);
    return () => window.clearInterval(timer);
  }, [signature, images.length]);
  const active = slide % Math.max(1, images.length);
  const Heading = compact ? 'h2' : 'h1';
  return <section className={`page-image-header${compact ? ' compact' : ''}`} aria-label={`${page} page header`}>
    <div className="page-header-images" aria-hidden="true">{images.map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className={index === active ? 'active' : ''} />)}</div>
    <div className="page-header-copy"><p className="eyebrow">{eyebrow}</p><Heading className="page-header-title">{title}</Heading>{intro && <p className="page-header-intro">{intro}</p>}</div>
    {images.length > 1 && <div className="page-header-dots">{images.map((_, index) => <button type="button" key={index} aria-label={`Show ${page} header image ${index + 1}`} aria-pressed={index === active} className={index === active ? 'active' : ''} onClick={() => setSlide(index)} />)}</div>}
  </section>;
}
