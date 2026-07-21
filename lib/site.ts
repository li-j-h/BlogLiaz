const isGitHubPages = process.env.GITHUB_PAGES === "true";

export const siteConfig = {
  name: "野路子手记",
  shortName: "野路子",
  author: "Liaz",
  description: "记录前端、爬虫与 AI 工程实践的个人博客，偶尔也写普通生活。",
  url: "https://lijh1013.github.io/BlogLiaz",
  basePath: isGitHubPages ? "/BlogLiaz" : "",
  github: "https://github.com/LiJH1013",
  repository: "https://github.com/LiJH1013/BlogLiaz",
  lastUpdated: "2026-07-21",
};
