const isGitHubPages = process.env.GITHUB_PAGES === "true";

export const siteConfig = {
  name: "野路子手记",
  shortName: "野路子",
  author: "Liaz",
  description: "记录前端、爬虫与 AI 工程实践的个人博客，偶尔也写普通生活。",
  url: isGitHubPages ? "https://li-j-h.github.io/BlogLiaz" : "https://wild-notes-2026.abc33094934.chatgpt.site",
  basePath: isGitHubPages ? "/BlogLiaz" : "",
  github: "https://github.com/li-j-h",
  repository: "https://github.com/li-j-h/BlogLiaz",
  lastUpdated: "2026-07-16",
};
