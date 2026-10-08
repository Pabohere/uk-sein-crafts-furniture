/** The business review is read-only; the demo administration stays local. */
export function blockedPreviewPath(pathname: string): boolean {
  let path = pathname;
  try {
    for (let i = 0; i < 10; i++) {
      const decoded = decodeURIComponent(path);
      if (decoded === path) break;
      path = decoded;
    }
  } catch { return true; }
  path = path.replace(/\\/g, "/").replace(/\/{2,}/g, "/");
  return /^\/(?:admin|api)(?:\/|$)/i.test(path)
    || /(?:^|\/)\.(?:env|git)(?:[./]|$)/i.test(path)
    || /\.map$/i.test(path);
}
export function securePreviewResponse(response: Response, nonce: string, https: boolean): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  headers.set("Content-Security-Policy", `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`);
  if (https) headers.set("Strict-Transport-Security", "max-age=31536000");
  headers.delete("X-Powered-By");
  headers.delete("Server");
  if (headers.get("Content-Type")?.includes("text/html") || response.status >= 400) headers.set("Cache-Control", "no-store");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
