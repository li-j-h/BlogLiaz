---
title: 一个可重复运行的网页采集脚本，需要先处理哪些失败
date: 2026-07-14
category: 爬虫
summary: 超时、状态码、重试、限速、缓存与 robots.txt，是采集代码从能跑到可靠的分界线。
tags: [网页采集、Fetch、稳定性]
readingMinutes: 8
published: true
---

“成功请求一次”只能证明地址当时可访问。一个可以重复运行的采集脚本，还要面对超时、限流、临时故障、重复下载和目标站点规则。先把这些边界写清楚，再讨论解析页面。

## 请求必须有超时和状态检查

`fetch()` 遇到 404 或 500 时通常不会自动抛出异常，需要检查 `response.ok`。网络长时间没有响应时，则应使用超时信号主动结束请求。

```js
async function fetchPage(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: { "user-agent": "LiazNotesBot/1.0 (+contact page)" },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}
```

超时、DNS 错误、429 和 500 不应该被记录成同一种失败。区分原因以后，才能决定是否重试。

## 只重试临时错误

429、502、503 和网络中断通常值得有限重试，404、401 或解析规则错误则不应该无限重复。重试间隔使用递增等待，并增加少量随机偏移，避免多个任务同时再次请求。

一个保守的默认值可以是最多三次，等待约 1 秒、2 秒和 4 秒。服务器提供 `Retry-After` 时优先尊重它。重试结束后保留 URL、状态码、次数和时间，方便复盘，而不是静默跳过。

## 限速和缓存比并发数量更重要

并发开得很大不一定更快，目标站点开始限流以后，失败和重试反而会放大流量。先按域名限制并发，再设置两次请求之间的最小间隔。

已经成功下载的响应可以按 URL 和抓取日期缓存。重复运行时先读取缓存，只有过期或明确要求刷新时才再次访问。这样既减少等待，也降低对对方服务的压力。

## 先检查站点规则

自动采集前应查看站点条款和 `robots.txt`，并使用能够说明用途和联系方式的 User-Agent。RFC 9309 规定了 robots.txt 的匹配与访问方式，但它不是访问授权，也不能替代身份验证和其他安全措施。

如果内容涉及登录、个人数据、付费内容或明确禁止的自动访问，应停止采集并改用官方 API 或获得许可。

## 把每次运行变得可解释

一次运行至少输出四类数据：计划处理多少 URL、命中多少缓存、成功多少、失败多少。失败记录保留原因和最后一次状态。这样第二天再运行时，结果变化能够被解释，也能安全地只重跑失败项。

## 延伸阅读

- [MDN：使用 Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN：AbortSignal 与请求超时](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
- [RFC 9309：Robots Exclusion Protocol](https://datatracker.ietf.org/doc/html/rfc9309)
