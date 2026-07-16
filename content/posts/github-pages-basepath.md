---
title: 为什么 GitHub Pages 子路径会让链接和资源一起失效
date: 2026-07-16
category: 前端
summary: 从 /BlogLiaz/ 出发，分清站点根路径、路由链接与静态资源路径。
tags: [GitHub Pages、Next.js、部署]
readingMinutes: 7
featured: true
published: true
---

项目站点的 GitHub Pages 地址通常不是域名根目录，而是 `https://用户名.github.io/仓库名/`。BlogLiaz 对应的公共前缀就是 `/BlogLiaz/`。本地开发时 `/articles` 可以打开，上线后却需要访问 `/BlogLiaz/articles/`，这就是许多“本地正常、线上失效”问题的起点。

## 先分清三种路径

页面路由、脚本样式和正文中的静态资源，看起来都像以 `/` 开头的地址，但构建工具处理它们的方式并不完全相同。

- 页面路由由框架的路由组件处理，配置 `basePath` 后通常会自动补前缀。
- 构建产物中的脚本和样式，需要在构建阶段写入正确的公共路径。
- Markdown 正文里的普通 `href` 和 `src` 字符串，不一定经过框架组件，需要自己转换。

因此只修改导航栏链接通常不够。首页能打开但样式丢失，说明资源前缀不对；样式正常但正文链接跳到域名根目录，说明内容转换阶段遗漏了前缀。

## 把前缀放在一个位置

不要在组件里到处手写 `/BlogLiaz`。更稳妥的方式是根据构建环境生成统一配置：GitHub Pages 构建使用 `/BlogLiaz`，普通预览环境使用空字符串。

```ts
const isGitHubPages = process.env.GITHUB_PAGES === "true";

export const siteConfig = {
  basePath: isGitHubPages ? "/BlogLiaz" : "",
};
```

框架配置、正文链接转换、RSS、站点地图和测试都读取同一个值。仓库名以后变化时，只需要修改一处，并重新构建。

## 用构建结果验证，而不是只看源码

最有价值的检查不是“配置文件写了什么”，而是导出的 HTML 最终包含什么。至少验证下面几项：

1. 页面脚本和样式地址包含 `/BlogLiaz/_next/`。
2. 站内文章链接指向 `/BlogLiaz/articles/`。
3. canonical、RSS 和 sitemap 使用完整公开网址。
4. 404 页面和隐私页仍能返回站内入口。

Next.js 的 `basePath` 会在构建时写入客户端包，因此改变前缀后必须重新构建。GitHub Pages 使用自定义构建流程时，则需要先上传静态产物，再由 Pages 部署该产物。

## 延伸阅读

- [Next.js 的 basePath 配置](https://nextjs.org/docs/pages/api-reference/config/next-config-js/basePath)
- [Next.js 静态导出](https://nextjs.org/docs/app/guides/static-exports)
- [GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
