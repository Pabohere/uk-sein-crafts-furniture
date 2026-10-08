import { readFileSync, writeFileSync } from "node:fs";
const config = JSON.parse(readFileSync(new URL("../dist/server/wrangler.json", import.meta.url), "utf8"));
// This public client review has no database or other paid services attached.
config.name = "uk-sein-crafts-preview";
config.workers_dev = true;
config.d1_databases = [];
config.r2_buckets = [];
config.observability = { enabled: false };
config.assets.run_worker_first = ["/admin", "/admin/*", "/api/*", "/.env*", "/.git/*"];
writeFileSync(new URL("../dist/server/wrangler-preview.json", import.meta.url), JSON.stringify(config, null, 2) + "\n");
console.log("Prepared database-free Cloudflare Workers preview configuration.");
