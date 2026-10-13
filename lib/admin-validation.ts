import { detailsText, type PostDetail } from './post-details';
import { defaultCatalog } from './catalog';
import { defaultContentForLanguage, defaultEvents } from './store-content';
export const initialResources = () => ({ catalog: defaultCatalog, categories: ['Seating', 'Tables', 'Decor'], events: defaultEvents, content_en: defaultContentForLanguage('en'), content_my: defaultContentForLanguage('my'), orders: [] });
export type Resource = keyof ReturnType<typeof initialResources>;
export const resourceNames = Object.keys(initialResources()) as Resource[];
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const string = (v: unknown, max = 10000) => typeof v === 'string' && v.length <= max;
const image = (v: unknown) => string(v, 650000) && (v === '' || /^https:\/\//.test(v as string) || /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(v as string));
const fields = (v: unknown, required: string[], optional: string[] = []) => record(v) && required.every(k => string(v[k])) && Object.keys(v).every(k => [...required, ...optional].includes(k));
export function validResource(name: Resource, value: unknown): boolean {
  if (name.startsWith('content_')) {
    if (!record(value) || !['home','about','events'].every(key => key in value) || Object.keys(value).some(key => !['home','about','events','pageImages','contact'].includes(key))) return false;
    const defaults = initialResources().content_en;
    for (const group of ['home','about','events'] as const) {
      const data = value[group];
      if (!record(data) || Object.keys(data).sort().join() !== Object.keys(defaults[group]).sort().join()) return false;
      for (const [key, item] of Object.entries(data)) {
        if (key === 'heroImages') { if (!Array.isArray(item) || item.length > 4 || !item.every(image)) return false; }
        else if (!string(item)) return false;
      }
    }
    if (value.contact !== undefined && !fields(value.contact, Object.keys(defaults.contact!))) return false;
    if (value.pageImages !== undefined) {
      const headers = value.pageImages;
      if (!record(headers) || Object.keys(headers).sort().join() !== 'about,collection,contact,events') return false;
      if (!Object.values(headers).every(images => Array.isArray(images) && images.length <= 4 && images.every(image))) return false;
    }
    return true;
  }
  if (!Array.isArray(value) || value.length > 300) return false;
  if (name === 'categories') return value.every(v => string(v, 100) && v.trim().length > 0) && new Set(value).size === value.length;
  if (value.some(v => !record(v) || !string(v.id,100) || !v.id || !/^[A-Za-z0-9_-]+$/.test(v.id as string)) || new Set(value.map(v => v.id)).size !== value.length) return false;
  if (name === 'catalog') return value.every(v => fields(v, ['id','name','category','price','description'], ['image','sizes','nameMy','descriptionMy','stockStatus','images']) && (v.images === undefined || (Array.isArray(v.images) && v.images.length <= 4 && v.images.every((item: unknown) => image(item) && item !== ''))) && (v.stockStatus === undefined || ['in_stock','out_of_stock','preorder'].includes(v.stockStatus)) && string(v.nameMy ?? '') && string(v.descriptionMy ?? '') && image(v.image) && Array.isArray(v.sizes) && v.sizes.length <= 10 && v.sizes.every((x:unknown) => string(x,30)));
  if (name === 'events') return value.every(v =>
    fields(v, ['id','title','date','button'], ['image','kind','content','images','details']) &&
    image(v.image) &&
    (v.details === undefined || (Array.isArray(v.details) && v.details.length <= 30 && v.details.every((part: unknown) => record(part) && (part.type === 'text' ? Object.keys(part).sort().join() === 'text,type' && string(part.text) : part.type === 'image' && Object.keys(part).sort().join() === 'alt,src,type' && string(part.alt, 300) && image(part.src) && part.src !== '')) && v.details.filter((part: PostDetail) => part.type === 'image').length <= 6 && detailsText(v.details) === (v.content || ''))) &&
    (v.kind === undefined || v.kind === 'event' || v.kind === 'blog') &&
    string(v.content ?? '') &&
    (v.kind !== 'blog' || (typeof v.content === 'string' && v.content.trim().length > 0 && v.title.trim().length > 0 && v.image !== '')) &&
    (v.images === undefined || (Array.isArray(v.images) && v.images.length <= 6 && v.images.every((item: unknown) => image(item) && item !== '')))
  );
  if (name === 'orders') return value.every(v => fields(v, ['id','customer','phone','address','item','total','status'], ['image','items']) && image(v.image) &&
    (v.items === undefined || (Array.isArray(v.items) && v.items.length > 0 && v.items.length <= 300 && v.items.every((item: unknown) => record(item) && fields(item, ['productId','name','size','image','price'], ['quantity']) && image(item.image) && Number.isInteger(item.quantity) && Number(item.quantity) > 0 && Number(item.quantity) <= 10000))));
  return false;
}
