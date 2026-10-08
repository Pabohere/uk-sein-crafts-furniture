# Client preview security

The deployed website is a read-only business review. The original administration UI remains a local development demo; it is not production authentication.

## Public deployment controls

- Admin and API routes are blocked in the Worker, including encoded path variants.
- Only GET and HEAD are allowed. Public mutation requests return 405.
- Development admin imports, password checks, and demo admin session code are removed from the public build.
- HTML scripts receive a fresh nonce matching a restrictive Content Security Policy. Framing, object embedding, cross-origin forms, and nonessential browser permissions are blocked.
- HTTPS responses use HSTS; responses also have nosniff and a referrer policy.
- HTML is not cached because its nonce changes per response. Source maps and sensitive dotfile paths are blocked.
- The standalone Cloudflare review deployment has no database, storage, or paid services attached.
- No secrets, browser sessions, dependency folders, local runtimes, or generated output are committed.

## Verification performed

Production storefront HTTP 200; admin and API HTTP 404; POST HTTP 405. All seven rendered script elements matched the response CSP nonce. Public bundles contained neither the demo password nor the demo admin session key. Production dependency audit reported zero findings before final tooling updates; patched framework packages and lockfile are included.

## Limits

This is a client preview, not a production commerce system. Browser-saved content remains local to each browser. Real orders, payments, shared content management, and production administration need server-side authentication, authorization, persistent data, and operational controls before launch.

The full development-tool audit still reports the unpatched `braces` issue and dependent build/lint tooling. Those tools are not exposed to public requests. Build only trusted source locally, keep the development server on loopback, and review future upstream fixes. No system is guaranteed completely secure by these changes.
