# Hosted admin and storefront security

The live `uksein-craft` Worker hosts the storefront and `/admin`. The public header has no admin link. `/admin` displays a login form; all private reads and writes require a server-validated session. Hiding a link is not an authorization control.

## Authentication and authorization

- A randomly generated 192-bit password is hashed with scrypt (N=32768, r=8, p=3) and a random salt. Only the hash and salt are installed as Cloudflare secrets; no password is shipped in browser code or committed to Git.
- Sessions use independent random 256-bit tokens, stored as hashes in the private Durable Object. Cookies use `__Host-`, `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`, and an eight-hour lifetime. Logout revokes the server session. Updating the password hash invalidates existing sessions.
- Login attempts are limited to five per 15 minutes per source IP; attempt counters persist across Worker restarts. IP keys are salted hashes. Expired sessions/counters are cleaned by an alarm.
- Every admin API read/write is authenticated at the Worker/DO boundary. The original unauthenticated D1 CRUD route is disabled. Unrecognized and encoded route variants fail closed.
- Mutations require a same-origin `Origin` and JSON content type. Cross-site requests are rejected. The public `/api/storefront` endpoint exposes only catalog, categories, events, and storefront content; it never returns orders or credentials.

## Data and browser controls

- SQLite-backed Durable Objects provide shared, persistent data on [Cloudflare Workers Free](https://developers.cloudflare.com/durable-objects/platform/pricing/). No D1/R2/paid services are attached. Free usage limits apply.
- Writes validate the resource shape, string/count limits, safe image types and URLs, and a 1 MB request cap. Uploaded images must be PNG/JPEG/WebP/GIF under 450 KB. Larger assets should use HTTPS image URLs.
- Per-resource revisions prevent silently overwriting changes from another admin session. Failed saves display an error; they are not marked as published.
- HTML uses per-response script nonces and a Content Security Policy. Framing is blocked; HTTPS uses HSTS. Responses have nosniff, referrer and browser-permission controls. HTML and API data are not cached. Dotfiles and source maps are blocked.
- Admin data is not placed in localStorage. The hosted storefront reads shared public data; local development retains the original browser-only demo.

## Verification

TypeScript check and production build passed. HTTP integration tests cover authentication, cookie attributes, CSRF, persistent writes/public reads, private order exclusion, revision conflicts, image validation, logout revocation, encoded paths, and login rate limiting. Production bundles contain no old demo password/session marker or seeded demo orders.

## Operation

Private bootstrap credentials are saved in ignored `.sites-runtime/admin-credentials.txt` with owner-only filesystem permissions. Keep that file private. Cloudflare account access controls password rotation and deployment. Back up content before extensive edits. A local browser's pre-existing demo edits are not automatically imported into the hosted store.

This is a small admin CMS for client review. Real checkout/payment/order intake is not implemented. There is one administrator; MFA, account recovery, audit history, and multi-user roles are not implemented. Do not treat this as a complete production commerce system.

The development-tool audit still reports the upstream `braces` issue and dependent build/lint tooling. Build only trusted source and keep local dev servers on loopback. No security changes guarantee a system is completely secure.
