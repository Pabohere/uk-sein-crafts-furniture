import { blockedPreviewPath, securePreviewResponse } from "../lib/preview-security";
import { handleAdminApi, type AdminEnv } from "../lib/admin-store";
export { AdminStore } from "../lib/admin-store";
import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

export default {
  async fetch(request: Request, env: Cloudflare.Env & Partial<AdminEnv> & { ADMIN_ENABLED?: string }, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    const url = new URL(request.url);
    const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18))));
    if (!import.meta.env.DEV) {
      const enabled = env.ADMIN_ENABLED === "true" && !!env.CMS;
      if (enabled && (url.pathname === "/api/storefront" || /^\/api\/admin\/[a-z_/]+$/.test(url.pathname))) {
        return securePreviewResponse(await handleAdminApi(request, env), nonce, url.protocol === "https:");
      }
      if (blockedPreviewPath(url.pathname) && !(enabled && url.pathname === "/admin")) return securePreviewResponse(new Response("Not found", { status: 404 }), nonce, url.protocol === "https:");
      if (!["GET", "HEAD"].includes(request.method)) return securePreviewResponse(new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } }), nonce, url.protocol === "https:");
    }
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    let response = await runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx));
    if (import.meta.env.DEV) return response;
    if (response.headers.get("Content-Type")?.includes("text/html")) {
      response = new HTMLRewriter().on("script", { element(element) { element.setAttribute("nonce", nonce); } }).transform(response);
    }
    return securePreviewResponse(response, nonce, url.protocol === "https:");
  },
};
