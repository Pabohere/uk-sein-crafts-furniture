"use client";
import { useEffect, useRef, useState } from 'react';
import { readProductImage } from '@/components/product-images-editor';
import { defaultPageImages, type PageHeaderImages, type PageHeaderKey } from '@/lib/store-content';
const pages: PageHeaderKey[] = ['collection', 'events', 'about', 'contact'];
const labels = { collection: 'Collection & product details', events: 'Events & blogs / article details', about: 'About us', contact: 'Contact us' };
export function PageHeaderImagesEditor({ value, update, onBusy }: { value?: PageHeaderImages; update: (images: PageHeaderImages) => void; onBusy: (busy: boolean) => void }) {
  const [page, setPage] = useState<PageHeaderKey>('collection'); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const mounted = useRef(true); useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const all = { ...defaultPageImages, ...value };
  const slots = Array.from({ length: 4 }, (_, index) => all[page][index] || '');
  const change = (index: number, image: string) => update({ ...all, [page]: slots.map((item, i) => i === index ? image : item) });
  return <div id="page-header-images" className="page-header-image-editor"><h3>Page header images</h3><p>Choose up to 4 images per page. Multiple images rotate like the Home carousel. Product and article detail pages use their section’s header images. Clear all slots to use the Home images.</p><fieldset disabled={busy} style={{border:0,padding:0,margin:0}}>
    <label>Page header<select aria-label="Choose page header" value={page} onChange={event => { setPage(event.target.value as PageHeaderKey); setError(''); }}>{pages.map(key => <option key={key} value={key}>{labels[key]}</option>)}</select></label>
    <div className="page-header-image-slots">{slots.map((image, index) => <div key={`${page}-${index}`}><label>{`${page} header image ${index + 1}`}<input aria-label={`${page} header image ${index + 1} URL`} type="url" pattern="https://.*" placeholder="https://…" value={image.startsWith('data:') ? '' : image} onChange={event => change(index, event.target.value)} /></label>
      <label>Upload image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={async event => {
        const file = event.target.files?.[0]; event.target.value = ''; if (!file || busy) return;
        setBusy(true); onBusy(true); setError('');
        try { const source = await readProductImage(file); if (mounted.current) change(index, source); }
        catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to upload image.'); }
        finally { setBusy(false); onBusy(false); }
      }} /></label>{image && <><img src={image} alt={`${labels[page]} header preview ${index + 1}`} /><button type="button" onClick={() => change(index, '')}>Remove image {index + 1}</button></>}
    </div>)}</div></fieldset>{busy && <p role="status">Preparing image…</p>}{error && <p role="alert">{error}</p>}
  </div>;
}
