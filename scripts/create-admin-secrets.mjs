import { randomBytes, scryptSync } from 'node:crypto';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
const dir = new URL('../.sites-runtime/', import.meta.url);
const secrets = new URL('admin-secrets.json', dir);
if (existsSync(secrets)) { console.log('Existing admin credentials retained.'); process.exit(0); }
mkdirSync(dir, {recursive:true});
const password = randomBytes(24).toString('base64url');
const salt = randomBytes(24).toString('hex');
const hash = scryptSync(password, salt, 32, {N:32768, r:8, p:3, maxmem:64*1024*1024}).toString('hex');
writeFileSync(secrets, JSON.stringify({ADMIN_PASSWORD_HASH:hash,ADMIN_PASSWORD_SALT:salt}), {mode:0o600});
writeFileSync(new URL('admin-credentials.txt', dir), `Admin URL: https://uksein-craft.uk-sein-crafts-furniture.workers.dev/admin\nUsername: admin\nPassword: ${password}\n\nKeep this file private. Do not share it with website visitors or commit it to Git.\n`, {mode:0o600});
console.log('Generated private admin credentials in ignored .sites-runtime/admin-credentials.txt.');
