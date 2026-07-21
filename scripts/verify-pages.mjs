import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, "out");
const required = [
  "index.html",
  "404.html",
  "articles/index.html",
  "articles/weekly-notes/index.html",
  "articles/github-pages-basepath/index.html",
  "articles/reliable-web-collector/index.html",
  "resources/index.html",
  "about/index.html",
  "hello/index.html",
  "privacy/index.html",
  "rss.xml",
  "sitemap.xml",
  "robots.txt",
  "manifest.webmanifest",
];

await Promise.all(required.map((file) => access(join(out, file))));
const home = await readFile(join(out, "index.html"), "utf8");
const about = await readFile(join(out, "about", "index.html"), "utf8");
const hello = await readFile(join(out, "hello", "index.html"), "utf8");
const resources = await readFile(join(out, "resources", "index.html"), "utf8");
const article = await readFile(join(out, "articles", "weekly-notes", "index.html"), "utf8");
const relatedArticle = await readFile(join(out, "articles", "github-pages-basepath", "index.html"), "utf8");
const notFound = await readFile(join(out, "404.html"), "utf8");
const rss = await readFile(join(out, "rss.xml"), "utf8");
const sitemap = await readFile(join(out, "sitemap.xml"), "utf8");

assert.match(home, /\/BlogLiaz\/_next\//);
assert.match(home, /\/BlogLiaz\/articles/);
assert.match(home, /href="https:\/\/github\.com\/LiJH1013"[^>]*aria-label="打开 LIAZ 的 GitHub 主页（新窗口）"|aria-label="打开 LIAZ 的 GitHub 主页（新窗口）"[^>]*href="https:\/\/github\.com\/LiJH1013"/);
assert.match(home, /aria-label="进入文章归档页"[^>]*href="\/BlogLiaz\/articles\/"/);
assert.match(home, /canonical" href="https:\/\/lijh1013\.github\.io\/BlogLiaz/);
assert.match(about, /href="\/BlogLiaz\/privacy/);
assert.match(about, /href="\/BlogLiaz\/hello\//);
assert.match(hello, /HELLO LIAZ \/ 访客登记处/);
assert.match(hello, /aria-label="会看向输入框并根据内容做出反应的纸片人 LIAZ"/);
assert.match(resources, /href="\/BlogLiaz\/resources/);
assert.match(resources, /RESOURCE FIELD \/ CURATED BY LIAZ/);
assert.doesNotMatch(about, /TO BE CONTINUED|暂时用一张字卡/);
assert.match(article, /href="#section-1"/);
assert.match(article, /id="section-1"/);
assert.match(article, /application\/ld\+json/);
assert.match(article, /property="og:image"/);
assert.match(relatedArticle, /RELATED \/ 同主题/);
assert.match(notFound, /这条路还没有内容/);
assert.match(rss, /https:\/\/lijh1013\.github\.io\/BlogLiaz\/articles\//);
assert.match(rss, /atom:link/);
assert.match(sitemap, /https:\/\/lijh1013\.github\.io\/BlogLiaz\/articles\//);
assert.match(sitemap, /https:\/\/lijh1013\.github\.io\/BlogLiaz\/resources/);
assert.match(sitemap, /https:\/\/lijh1013\.github\.io\/BlogLiaz\/hello/);
console.log(`Verified ${required.length} GitHub Pages files with the /BlogLiaz base path.`);
