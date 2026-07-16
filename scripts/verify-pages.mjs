import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, "out");
const required = [
  "index.html",
  "articles/index.html",
  "articles/weekly-notes/index.html",
  "articles/github-pages-basepath/index.html",
  "articles/reliable-web-collector/index.html",
  "about/index.html",
  "privacy/index.html",
  "rss.xml",
  "sitemap.xml",
  "robots.txt",
  "manifest.webmanifest",
];

await Promise.all(required.map((file) => access(join(out, file))));
const home = await readFile(join(out, "index.html"), "utf8");
const about = await readFile(join(out, "about", "index.html"), "utf8");
const article = await readFile(join(out, "articles", "weekly-notes", "index.html"), "utf8");
const rss = await readFile(join(out, "rss.xml"), "utf8");
const sitemap = await readFile(join(out, "sitemap.xml"), "utf8");

assert.match(home, /\/BlogLiaz\/_next\//);
assert.match(home, /\/BlogLiaz\/articles/);
assert.match(home, /canonical" href="https:\/\/li-j-h\.github\.io\/BlogLiaz/);
assert.match(about, /href="\/BlogLiaz\/privacy/);
assert.doesNotMatch(about, /TO BE CONTINUED|暂时用一张字卡/);
assert.match(article, /href="#section-1"/);
assert.match(article, /id="section-1"/);
assert.match(rss, /https:\/\/li-j-h\.github\.io\/BlogLiaz\/articles\//);
assert.match(rss, /atom:link/);
assert.match(sitemap, /https:\/\/li-j-h\.github\.io\/BlogLiaz\/articles\//);
console.log(`Verified ${required.length} GitHub Pages files with the /BlogLiaz base path.`);
