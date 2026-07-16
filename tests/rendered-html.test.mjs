import assert from "node:assert/strict";
import test from "node:test";

const workerUrl = new URL(`../dist/server/index.js?test=${Date.now()}`, import.meta.url);
const { default: worker } = await import(workerUrl.href);
const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const context = { waitUntil() {}, passThroughOnException() {} };

async function request(path) {
  return worker.fetch(new Request(`http://localhost${path}`), env, context);
}

test("renders the public blog routes", async () => {
  const routes = ["/", "/articles", "/resources", "/articles/weekly-notes", "/articles/github-pages-basepath", "/articles/reliable-web-collector", "/about", "/privacy"];
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
  const article = await (await request("/articles/weekly-notes")).text();

  assert.doesNotMatch(home, /读完《|走了十二公里/);
  assert.doesNotMatch(about, /TO BE CONTINUED|暂时用一张字卡/);
  assert.match(about, /作者 \/ LIAZ/);
  assert.match(home, /前端、爬虫与 AI 工程/);
  assert.match(home, />LIAZ<\/span>/);
  assert.match(archive, /START HERE \/ 从这里开始/);
  assert.match(archive, /按技术方向浏览/);
  assert.match(archive, /查看全部(?:\s|<!--.*?-->)*07(?:\s|<!--.*?-->)*篇/);
  assert.match(resources, /RESOURCE FIELD \/ CURATED BY LIAZ/);
  assert.match(resources, /<span>资源<\/span><span>工作台<\/span>/);
  assert.match(resources, /收藏夹/);
  assert.match(article, /本文目录/);
  assert.match(article, /id="section-1"/);
  assert.match(article, /href="#section-1"/);
});
