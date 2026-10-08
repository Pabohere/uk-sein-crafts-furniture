// Public CMS data is kept in memory; private admin data is never cached here.
let data: Record<string, unknown> | null = null;
export const setPublicData = (next: Record<string, unknown>) => { data = next; };
export const publicData = <T>(name: string): T | undefined => data?.[name] as T | undefined;
