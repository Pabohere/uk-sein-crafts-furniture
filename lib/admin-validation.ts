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
    if (!record(value) || Object.keys(value).sort().join() !== 'about,events,home') return false;
    const defaults = initialResources().content_en;
    for (const group of ['home','about','events'] as const) {
      const data = value[group];
      if (!record(data) || Object.keys(data).sort().join() !== Object.keys(defaults[group]).sort().join()) return false;
      for (const [key, item] of Object.entries(data)) {
        if (key === 'heroImages') { if (!Array.isArray(item) || item.length > 4 || !item.every(image)) return false; }
        else if (!string(item)) return false;
      }
    }
    return true;
  }
  if (!Array.isArray(value) || value.length > 300) return false;
  if (name === 'categories') return value.every(v => string(v, 100) && v.trim().length > 0) && new Set(value).size === value.length;
  if (value.some(v => !record(v) || !string(v.id,100) || !v.id || !/^[A-Za-z0-9_-]+$/.test(v.id as string)) || new Set(value.map(v => v.id)).size !== value.length) return false;
  if (name === 'catalog') return value.every(v => fields(v, ['id','name','category','price','description'], ['image','sizes','nameMy','descriptionMy']) && string(v.nameMy ?? '') && string(v.descriptionMy ?? '') && image(v.image) && Array.isArray(v.sizes) && v.sizes.length <= 10 && v.sizes.every((x:unknown) => string(x,30)));
  if (name === 'events') return value.every(v => fields(v, ['id','title','date','button'], ['image']) && image(v.image));
  if (name === 'orders') return value.every(v => fields(v, ['id','customer','phone','address','item','total','status'], ['image']) && image(v.image));
  return false;
}
