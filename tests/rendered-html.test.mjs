import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const siteCss = await readFile(new URL("../app/site.module.css", import.meta.url), "utf8");
const articleBrowserSource = await readFile(new URL("../app/articles/article-browser.tsx", import.meta.url), "utf8");

function cssRule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = siteCss.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `missing CSS rule: ${selector}`);
  return match[1];
}

const workerUrl = new URL(`../dist/server/index.js?test=${Date.now()}`, import.meta.url);
const { default: worker } = await import(workerUrl.href);
const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const context = { waitUntil() {}, passThroughOnException() {} };

async function request(path) {
  return worker.fetch(new Request(`http://localhost${path}`), env, context);
}

test("renders the public blog routes", async () => {
  const routes = ["/", "/articles", "/resources", "/articles/weekly-notes", "/articles/github-pages-basepath", "/articles/reliable-web-collector", "/about", "/hello", "/privacy"];
  for (const route of routes) {
    const response = await request(route);
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html/i, route);
    assert.match(await response.text(), /野路子/, route);
  }
});

test("publishes discovery files", async () => {
  const expected = [
    ["/rss.xml", "application/rss+xml", /<rss/],
    ["/sitemap.xml", "application/xml", /<urlset/],
    ["/robots.txt", "text/plain", /Sitemap:/],
    ["/manifest.webmanifest", "application/manifest+json", /野路子手记/],
  ];
  for (const [route, contentType, pattern] of expected) {
    const response = await request(route);
    assert.equal(response.status, 200, route);
    assert.ok((response.headers.get("content-type") ?? "").startsWith(contentType), route);
    assert.match(await response.text(), pattern, route);
  }
});

test("renders verified copy and article navigation", async () => {
  const home = await (await request("/")).text();
  const archive = await (await request("/articles")).text();
  const resources = await (await request("/resources")).text();
  const about = await (await request("/about")).text();
  const hello = await (await request("/hello")).text();
  const article = await (await request("/articles/weekly-notes")).text();
  const relatedArticle = await (await request("/articles/github-pages-basepath")).text();

  assert.doesNotMatch(home, /读完《|走了十二公里/);
  assert.doesNotMatch(about, /TO BE CONTINUED|暂时用一张字卡/);
  assert.match(about, /作者 \/ LIAZ/);
  assert.match(about, /data-about-reader="true"/);
  assert.match(about, /LIAZ \/ TEA, READ, REPEAT/);
  assert.match(about, /喝茶一边看书/);
  assert.match(about, /href="\/hello"/);
  assert.match(hello, /HELLO LIAZ \/ 访客登记处/);
  assert.match(hello, /只用来触发纸片人的反应/);
  assert.match(hello, /生成访客签/);
  assert.match(home, /前端、爬虫与 AI 工程/);
  assert.match(home, />LIAZ<\/a>/);
  assert.match(home, /aria-label="打开 LIAZ 的 GitHub 主页（新窗口）"/);
  assert.match(home, /aria-label="进入文章归档页"/);
  assert.match(archive, /START HERE \/ 从这里开始/);
  assert.match(archive, /按技术方向浏览/);
  assert.match(archive, /data-cursor-instrument="true"/);
  assert.match(archive, /aria-label="启动文章方向扫描特效"/);
  assert.match(archive, /SCAN \/ 触发扫描/);
  assert.match(archive, /FRONT/);
  assert.match(archive, /查看全部(?:\s|<!--.*?-->)*07(?:\s|<!--.*?-->)*篇/);
  assert.match(resources, /RESOURCE FIELD \/ CURATED BY LIAZ/);
  assert.match(resources, /<span>资源<\/span><span>工作台<\/span>/);
  assert.match(resources, /收藏夹/);
  assert.match(article, /本文目录/);
  assert.match(article, /id="section-1"/);
  assert.match(article, /href="#section-1"/);
  assert.match(article, /application\/ld\+json/);
  assert.match(article, /property="og:image"/);
  assert.match(relatedArticle, /RELATED \/ 同主题/);
});

test("keeps interactive article text out of transform layers", () => {
  assert.doesNotMatch(cssRule(".postLink:hover"), /perspective|rotate|scale|translate3d/);
  assert.doesNotMatch(cssRule(".topicButton"), /\btransform\s*:/);
  assert.doesNotMatch(cssRule(".featuredStory"), /\btransform\s*:/);
  assert.match(siteCss, /\.topicButton:hover::before/);
  assert.match(siteCss, /@keyframes scanBurst/);
  assert.match(siteCss, /@keyframes topicScan/);
  assert.match(siteCss, /\.articleBody pre\s*\{[^}]*overflow-x:\s*auto/);
});

test("keeps the archive scan effect clickable across the whole lead area", () => {
  assert.match(articleBrowserSource, /data-scan-surface="true"/);
  assert.match(articleBrowserSource, /onClick=\{handleLeadClick\}/);
  assert.match(articleBrowserSource, /closest\("a, button, input"\)/);
  assert.doesNotMatch(cssRule('.archiveLead[data-pointer-active="true"] .cursorInstrument'), /pointer-events:\s*auto/);
});
