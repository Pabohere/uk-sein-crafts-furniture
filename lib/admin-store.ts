import { scrypt } from "node:crypto";
import { DurableObject } from 'cloudflare:workers';
import { initialResources, resourceNames, validResource, type Resource } from './admin-validation';
export interface AdminEnv { CMS: DurableObjectNamespace<AdminStore>; ADMIN_PASSWORD_HASH: string; ADMIN_PASSWORD_SALT: string; ADMIN_USERNAME?: string; }
const encoder = new TextEncoder();
const hex = (bytes: ArrayBuffer) => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2,'0')).join('');
const digest = async (text: string) => hex(await crypto.subtle.digest('SHA-256', encoder.encode(text)));
const token = () => hex(crypto.getRandomValues(new Uint8Array(32)).buffer);
const cookieName = '__Host-uksein_session';
const cookie = (value: string, age = 28800) => `${cookieName}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
const json = (data: unknown, status = 200, headers: HeadersInit = {}) => Response.json(data, {status, headers: {'Cache-Control':'private, no-store', ...headers}});
export async function passwordHash(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => scrypt(password, salt, 32, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }, (error, key) => error ? reject(error) : resolve(Array.from(key, b => b.toString(16).padStart(2, '0')).join(''))));
}
const equal = (a:string,b:string) => { let result = a.length ^ b.length; for(let i=0;i<Math.max(a.length,b.length);i++)result |= (a.charCodeAt(i)||0) ^ (b.charCodeAt(i)||0); return result === 0; };
async function body(request: Request) {
  if (Number(request.headers.get('content-length')) > 1000000) throw Error('too_large');
  const reader = request.body?.getReader(); if (!reader) throw Error('invalid');
  const chunks: Uint8Array[] = []; let size=0;
  while (true) { const {done,value}=await reader.read(); if(done)break;size+=value.byteLength;if(size>1000000){await reader.cancel();throw Error('too_large');}chunks.push(value); }
  const buffer = new Uint8Array(size);let offset=0;for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.length;}
  return JSON.parse(new TextDecoder().decode(buffer));
}
export class AdminStore extends DurableObject<AdminEnv> {
  constructor(ctx:DurableObjectState, env:AdminEnv) { super(ctx,env); }
  async fetch(request:Request):Promise<Response> {
    const url=new URL(request.url), path=url.pathname;
    const storage=this.ctx.storage;
    const defaults=initialResources();
    const read=async (name:Resource) => await storage.get<{value:unknown;revision:number}>('data:'+name) ?? {value:defaults[name],revision:0};
    if(path==='/api/storefront' && request.method==='GET') {
      const data:Record<string,unknown>={};for(const name of resourceNames.filter(n=>n!=='orders'))data[name]=(await read(name)).value;
      return json({data});
    }
    if (!this.env.ADMIN_PASSWORD_HASH || !this.env.ADMIN_PASSWORD_SALT) return json({error:'Administration is unavailable.'},503);
    const mutation=!['GET','HEAD'].includes(request.method);
    let inputBody: any;
    if (mutation) {
      try { inputBody = await body(request); }
      catch(e) { return json({error:e instanceof Error && e.message==='too_large' ? 'This section exceeds 1 MB.' : 'Invalid request body.'},e instanceof Error && e.message==='too_large'?413:400); }
    }
    if(mutation && (request.headers.get('origin')!==url.origin || request.headers.get('sec-fetch-site')==='cross-site' || request.headers.get('content-type')?.split(';')[0]!=='application/json'))return json({error:'Request rejected.'},403);
    try {
      if(path==='/api/admin/login' && request.method==='POST') {
        const ip = await digest(this.env.ADMIN_PASSWORD_SALT + ':' + (request.headers.get('cf-connecting-ip') || 'local'));
        const attemptKey='attempt:'+ip;
        const now=Date.now();
        const attempts=await storage.transaction(async txn => {
          let value=await txn.get<{count:number;until:number}>(attemptKey);
          if(!value || value.until<=now)value={count:0,until:now+15*60*1000};
          const allowed=value.count<5;
          if(allowed){value.count++;await txn.put(attemptKey,value);}
          return {...value,allowed};
        });
        if(!attempts.allowed)return json({error:'Too many attempts. Try again in 15 minutes.'},429,{'Retry-After':String(Math.ceil((attempts.until-now)/1000))});
        // Cleanup happens on an alarm; entries survive Worker restarts.
        if(!await storage.getAlarm())await storage.setAlarm(now+15*60*1000);
        const input=inputBody;
        if(typeof input.username!=='string'||typeof input.password!=='string'||input.password.length>256)return json({error:'Invalid credentials.'},401);
        let hashed: string;
        try { hashed=await passwordHash(input.password,this.env.ADMIN_PASSWORD_SALT); }
        catch(e) { await storage.delete(attemptKey); throw e; }
        if(!equal(hashed,this.env.ADMIN_PASSWORD_HASH)||input.username!==(this.env.ADMIN_USERNAME||'admin'))return json({error:'Invalid credentials.'},401);
        await storage.delete(attemptKey);
        const session=token();await storage.put('session:'+await digest(session),{expires:now+8*60*60*1000,version:this.env.ADMIN_PASSWORD_HASH});
        return json({ok:true},200,{'Set-Cookie':cookie(session)});
      }
      const session=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);
      const sessionKey=session && /^[a-f0-9]{64}$/.test(session) ? 'session:'+await digest(session) : '';
      const active=sessionKey ? await storage.get<{expires:number;version:string}>(sessionKey) : undefined;
      if(!active || active.expires<=Date.now() || active.version!==this.env.ADMIN_PASSWORD_HASH)return json({error:'Please sign in.'},401,{'Set-Cookie':cookie('',0)});
      if(path==='/api/admin/session' && request.method==='GET')return json({ok:true});
      if(path==='/api/admin/logout' && request.method==='POST'){await storage.delete(sessionKey);return json({ok:true},200,{'Set-Cookie':cookie('',0)});}
      if(path==='/api/admin/state' && request.method==='GET'){
        const data:Record<string,unknown>={},revisions:Record<string,number>={};
        for(const name of resourceNames){const row=await read(name);data[name]=row.value;revisions[name]=row.revision;}
        return json({data,revisions});
      }
      const resource=path.match(/^\/api\/admin\/resources\/([a-z_]+)$/)?.[1] as Resource;
      if(resourceNames.includes(resource) && request.method==='PUT') {
        const input=inputBody;
        if(!Number.isInteger(input.revision)||!validResource(resource,input.data))return json({error:'Invalid data. Use HTTPS image URLs or PNG/JPEG/WebP/GIF images.'},400);
        const result=await storage.transaction(async txn=>{
          const current=await txn.get<{value:unknown;revision:number}>('data:'+resource) ?? {value:defaults[resource],revision:0};
          if(current.revision!==input.revision)return json({error:'This section changed in another session. Reload before saving.'},409);
          const revision=current.revision+1;await txn.put('data:'+resource,{value:input.data,revision});return json({ok:true,revision});
        });
        return result;
      }
      return json({error:'Not found.'},404);
    } catch (e) {
      console.error('Admin operation failed:', e instanceof Error ? e.message : 'Unknown error');
      return json({error:e instanceof Error && e.message==='too_large' ? 'This section exceeds 1 MB. Use image URLs or smaller images.' : 'Unable to process request.'},e instanceof Error && e.message==='too_large'?413:400);
    }
  }
  async alarm() {
    const now=Date.now();
    for(const prefix of ['session:','attempt:']) {
      const entries=await this.ctx.storage.list<{expires?:number;until?:number}>({prefix});
      for(const [key,value]of entries)if((value.expires??value.until??0)<=now)await this.ctx.storage.delete(key);
    }
    if((await this.ctx.storage.list({prefix:'session:',limit:1})).size || (await this.ctx.storage.list({prefix:'attempt:',limit:1})).size)await this.ctx.storage.setAlarm(now+15*60*1000);
  }
}
export async function handleAdminApi(request:Request, env:Partial<AdminEnv>) {
  if(!env.CMS)return json({error:'Not found.'},404);
  const object=env.CMS.get(env.CMS.idFromName('uksein-site-v1'));
  return object.fetch(request);
}
