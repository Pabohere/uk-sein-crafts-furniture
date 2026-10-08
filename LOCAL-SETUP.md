# Uk Sein Crafts — local setup

This folder was extracted from `uk-sein-crafts-source-v8.zip`. It contains the v8 source, rather than a Git clone with repository history.

## Run in VS Code

Open this folder in VS Code. Choose **Terminal → Run Task → Website: Start development server**, then open http://127.0.0.1:5173.

Or use the integrated terminal:

```sh
./scripts/local.sh dev -- --hostname 127.0.0.1
```

Stop the server with Control+C. Build with **Terminal → Run Build Task** or `./scripts/local.sh build`.

A project-local Node.js 24.19.0 runtime is included for this Apple Silicon Mac. New VS Code terminals also expose `node` and `npm`. On another machine, install Node.js 24 LTS and run `npm run install:ci`.

## Source and data

- Pages: `app/`; storefront components: `components/`; styles: `app/*.css`.
- `/admin` is the existing demo admin interface. Its sign-in check is defined in `app/admin/page.tsx`.
- Storefront/admin edits and demo orders use this browser's localStorage. They are not shared between browsers or users; clearing site data removes them.
- Remote Unsplash photos need internet access. Logos are bundled in `public/`.
- The source includes Cloudflare D1 API routes and a schema. The bundled initial migration has been applied to the local database. The database tables start empty; the current browser-based admin uses localStorage independently.
- This setup runs locally; it does not publish the website.

The original starter documentation remains in `README.md`.

## English / Myanmar

The header language selector switches the storefront between English and Myanmar and remembers the selection in this browser. In Admin → All storefront content, select the content language and save each version separately. Product forms include optional Myanmar names and descriptions. Existing pre-switcher Myanmar content is retained in the Myanmar version. Carousel images are shared between both languages.

Default labels and sample content translations live in `lib/translations.ts`; custom content stays in browser localStorage as described above.

## Free Cloudflare client preview

This source includes a standalone, database-free Cloudflare Workers review deployment. Sign in to your own Cloudflare account with its free Workers plan; do not enable a paid plan.

```sh
PATH="$PWD/.local-node/bin:$PATH" node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js login
./scripts/local.sh deploy:preview
```

Use the HTTPS URL printed after a successful deployment. The preview blocks admin/API routes and writes; the local development admin is unchanged. See `SECURITY.md` for the controls and remaining limitations.

## Hosted administration

The hosted `/admin` uses server authentication and shared SQLite-backed Durable Object storage. `scripts/create-admin-secrets.mjs` creates a private random bootstrap password and its scrypt hash in ignored `.sites-runtime/` files. Do not commit or send these files to clients.

First setup:

```sh
./scripts/local.sh build
.local-node/bin/node scripts/prepare-cloudflare-preview.mjs
.local-node/bin/node scripts/create-admin-secrets.mjs
PATH="$PWD/.local-node/bin:$PATH" node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js secret bulk .sites-runtime/admin-secrets.json --config dist/server/wrangler-preview.json
./scripts/local.sh deploy:preview
```

Ordinary deployments retain existing secrets and data. Do not regenerate bootstrap credentials unless intentionally rotating the password; updating the Cloudflare hash revokes existing sessions. Follow `SECURITY.md` for limits and controls.

For local production API checks, generate the admin secrets, copy their key/value pairs into ignored `dist/server/.dev.vars`, prepare the preview configuration, and run Wrangler locally on loopback. `tests/admin-http.mjs` reads the private test credentials, performs reversible catalog edits, and restores them. It is intended for a disposable local test store, not production.
