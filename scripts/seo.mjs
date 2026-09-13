// scripts/seo.mjs — SEO build worker for GitHub Pages.
// Generates robots.txt + sitemap.xml from site.config.json and submits URLs to IndexNow.
// Usage: node scripts/seo.mjs [--skip-submit]
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(resolve(root, "site.config.json"), "utf8"));
const siteUrl = config.siteUrl.replace(/\/$/, "");
const skipSubmit = process.argv.includes("--skip-submit");

const today = new Date().toISOString().slice(0, 10);

const urls = config.pages.map((p) => `${siteUrl}${p.path}`);

const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  config.pages
    .map(
      (p) =>
        `  <url>\n    <loc>${siteUrl}${p.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
    )
    .join("\n") +
  `\n</urlset>\n`;

writeFileSync(resolve(root, "sitemap.xml"), sitemap);
writeFileSync(
  resolve(root, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
);
writeFileSync(resolve(root, `${config.indexNowKey}.txt`), `${config.indexNowKey}\n`);
console.log(`[seo] robots.txt + sitemap.xml generated for ${siteUrl}`);

if (skipSubmit) {
  console.log("[seo] IndexNow submit skipped (--skip-submit)");
  process.exit(0);
}

const host = new URL(siteUrl).host;
const payload = JSON.stringify({
  host,
  key: config.indexNowKey,
  keyLocation: `${siteUrl}/${config.indexNowKey}.txt`,
  urlList: urls,
});

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: payload,
});
console.log(`[seo] IndexNow submit: ${res.status} for ${urls.length} urls`);
if (![200, 202].includes(res.status)) {
  const text = await res.text().catch(() => "");
  console.error(`[seo] IndexNow failed: ${res.status} ${text}`);
  process.exit(1);
}
