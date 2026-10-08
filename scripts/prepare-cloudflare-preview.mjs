import { readFileSync, writeFileSync } from "node:fs";
const config = JSON.parse(readFileSync(new URL("../dist/server/wrangler.json", import.meta.url), "utf8"));
// SQLite-backed Durable Objects work on Cloudflare Workers Free; no paid services are attached.
config.name = "uksein-craft";
config.workers_dev = true;
config.vars = { ADMIN_ENABLED: "true" };
config.durable_objects = { bindings: [{ name: "CMS", class_name: "AdminStore" }] };
config.migrations = [{ tag: "cms-v1", new_sqlite_classes: ["AdminStore"] }];
config.d1_databases = [];
config.r2_buckets = [];
config.observability = { enabled: false };
config.assets.run_worker_first = ["/admin", "/admin/*", "/api/*", "/.env*", "/.git/*"];
writeFileSync(new URL("../dist/server/wrangler-preview.json", import.meta.url), JSON.stringify(config, null, 2) + "\n");
console.log("Prepared Cloudflare Free admin and storefront configuration.");
