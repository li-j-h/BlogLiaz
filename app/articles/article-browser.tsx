"use client";

import Link from "next/link";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { topicDefinitions, topicOrder, type PostCategory } from "@/lib/topics";
import styles from "../site.module.css";

type BrowserPost = {
  slug: string;
  title: string;
  date: string;
  category: PostCategory;
  summary: string;
  tags: string[];
  readingMinutes: number;
  featured: boolean;
};

export function ArticleBrowser({ posts }: { posts: BrowserPost[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [tag, setTag] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("准星已就绪");
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const archiveLeadRef = useRef<HTMLDivElement>(null);
  const pointerInstrumentRef = useRef<HTMLButtonElement>(null);
  const pointerReadoutRef = useRef<HTMLElement>(null);
  const pointerFrame = useRef<number | null>(null);
  const scanFrame = useRef<number | null>(null);
  const scanTimer = useRef<number | null>(null);
  const pointerPosition = useRef({ x: 0, y: 0 });
  const featuredPost = posts.find((post) => post.featured) ?? posts[0];
  const topics = topicOrder
    .map((name) => ({ name, count: posts.filter((post) => post.category === name).length }))
    .filter((topic) => topic.count > 0);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("zh-CN");
    return posts.filter((post) => {
      const inCategory = category === "全部" || post.category === category;
      const hasTag = !tag || post.tags.includes(tag);
      const haystack = [post.title, post.summary, post.category, ...post.tags].join(" ").toLocaleLowerCase("zh-CN");
      return inCategory && hasTag && (!keyword || haystack.includes(keyword));
    });
  }, [category, posts, query, tag]);

  useEffect(() => {
    function restoreFilters() {
      const params = new URLSearchParams(window.location.search);
      const nextCategory = params.get("category");
      setQuery(params.get("q") ?? "");
      setCategory(nextCategory && topicOrder.includes(nextCategory as PostCategory) ? nextCategory : "全部");
      setTag(params.get("tag") ?? "");
    }
    restoreFilters();
    window.addEventListener("popstate", restoreFilters);
    return () => window.removeEventListener("popstate", restoreFilters);
  }, []);

  function syncUrl(next: { query?: string; category?: string; tag?: string }) {
    const params = new URLSearchParams(window.location.search);
    const values = { query, category, tag, ...next };
    if (values.query) params.set("q", values.query); else params.delete("q");
    if (values.category !== "全部") params.set("category", values.category); else params.delete("category");
    if (values.tag) params.set("tag", values.tag); else params.delete("tag");
    const search = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`);
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape" && document.activeElement === searchRef.current) {
        setQuery("");
        searchRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => () => {
    if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current);
    if (scanFrame.current !== null) cancelAnimationFrame(scanFrame.current);
    if (scanTimer.current !== null) window.clearTimeout(scanTimer.current);
  }, []);

  function updateInkFollower(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerPosition.current = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    event.currentTarget.dataset.pointerActive = "true";
    if (pointerFrame.current !== null) return;
    const target = event.currentTarget;
    pointerFrame.current = requestAnimationFrame(() => {
      target.style.setProperty("--cursor-x", `${pointerPosition.current.x}px`);
      target.style.setProperty("--cursor-y", `${pointerPosition.current.y}px`);
      if (pointerInstrumentRef.current) {
        const x = Math.round(pointerPosition.current.x).toString().padStart(3, "0");
        const y = Math.round(pointerPosition.current.y).toString().padStart(3, "0");
        if (pointerReadoutRef.current) pointerReadoutRef.current.dataset.coordinate = `X ${x} / Y ${y}`;
      }
      pointerFrame.current = null;
    });
  }

  function updateFeatureSpotlight(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--spot-x", `${((x + 0.5) * 100).toFixed(1)}%`);
    event.currentTarget.style.setProperty("--spot-y", `${((y + 0.5) * 100).toFixed(1)}%`);
    event.currentTarget.style.setProperty("--shadow-x", `${Math.round(-x * 14 + 10)}px`);
    event.currentTarget.style.setProperty("--shadow-y", `${Math.round(-y * 14 + 10)}px`);
  }

  function resetFeatureSpotlight(event: ReactPointerEvent<HTMLElement>) {
    event.currentTarget.style.setProperty("--spot-x", "72%");
    event.currentTarget.style.setProperty("--spot-y", "38%");
    event.currentTarget.style.setProperty("--shadow-x", "10px");
    event.currentTarget.style.setProperty("--shadow-y", "10px");
  }

  function updateMagnet(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--magnet-x", `${(x * 8).toFixed(1)}px`);
    event.currentTarget.style.setProperty("--magnet-y", `${(y * 6).toFixed(1)}px`);
  }

  function resetMagnet(event: ReactPointerEvent<HTMLButtonElement>) {
    event.currentTarget.style.setProperty("--magnet-x", "0px");
    event.currentTarget.style.setProperty("--magnet-y", "0px");
  }

  function triggerScan(origin: HTMLElement) {
    const lead = archiveLeadRef.current;
    if (lead) {
      const leadBounds = lead.getBoundingClientRect();
      const originBounds = origin.getBoundingClientRect();
      const x = originBounds.left + originBounds.width / 2 - leadBounds.left;
      const y = originBounds.top + originBounds.height / 2 - leadBounds.top;
      lead.style.setProperty("--cursor-x", `${x}px`);
      lead.style.setProperty("--cursor-y", `${y}px`);
    }

    if (scanFrame.current !== null) cancelAnimationFrame(scanFrame.current);
    if (scanTimer.current !== null) window.clearTimeout(scanTimer.current);
    setScanning(false);
    setScanStatus("正在扫描文章方向…");
    scanFrame.current = requestAnimationFrame(() => {
      scanFrame.current = requestAnimationFrame(() => {
        scanFrame.current = null;
        setScanning(true);
        setScanStatus(`扫描完成：发现 ${topics.length} 个方向、${posts.length} 篇文章`);
        scanTimer.current = window.setTimeout(() => {
          setScanning(false);
          scanTimer.current = null;
        }, 1180);
      });
    });
  }

  function handleLeadClick(event: ReactMouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("a, button, input")) return;
    triggerScan(event.currentTarget);
  }

  function selectCategory(nextCategory: string) {
    setCategory(nextCategory);
    setTag("");
    syncUrl({ category: nextCategory, tag: "" });
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior, block: "start" }));
  }

  function resetFilters() {
    setQuery("");
    setCategory("全部");
    setTag("");
    syncUrl({ query: "", category: "全部", tag: "" });
  }

  return (
    <section className={styles.archiveExperience} data-search-active={searchActive} data-scanning={scanning} aria-label="文章导航、筛选与列表">
      <div
        className={styles.archiveLead}
        data-scan-surface="true"
        ref={archiveLeadRef}
        onClick={handleLeadClick}
        onPointerMove={updateInkFollower}
        onPointerLeave={(event) => { event.currentTarget.dataset.pointerActive = "false"; }}
      >
        <h1 className={styles.archiveTitle}>所有<br />文章</h1>
        <div className={styles.archiveIntro}>
          <p className={styles.archiveStatement}>这里主要记录可复现的技术过程，也偶尔留下普通生活。</p>
          <p>从前端、爬虫和 AI 开始，按兴趣选择方向，或者直接搜索一个问题。</p>
          <button className={styles.archiveAllButton} type="button" aria-pressed={category === "全部"} onClick={() => selectCategory("全部")}>查看全部 {String(posts.length).padStart(2, "0")} 篇</button>
          <button className={styles.scanFallback} type="button" onClick={(event) => triggerScan(event.currentTarget)}>SCAN / 触发扫描</button>
        </div>
        <button
          className={styles.cursorInstrument}
          data-cursor-instrument
          ref={pointerInstrumentRef}
          type="button"
          aria-label="启动文章方向扫描特效"
          onClick={(event) => { event.stopPropagation(); triggerScan(event.currentTarget); }}
        >
          <span className={styles.cursorOuter} aria-hidden="true" />
          <span className={styles.cursorInner} aria-hidden="true" />
          <span className={styles.cursorSweep} aria-hidden="true" />
          <span className={styles.cursorDot} aria-hidden="true" />
          <i aria-hidden="true">FRONT</i><i aria-hidden="true">CRAWL</i><i aria-hidden="true">AI</i><i aria-hidden="true">LIFE</i>
          <b data-coordinate="X 000 / Y 000" ref={pointerReadoutRef} aria-hidden="true">SCAN</b>
        </button>
        <p className={styles.scanStatus} aria-live="polite">{scanStatus}</p>
      </div>

      <div className={styles.topicMap} role="group" aria-label="按技术方向浏览">
        {topics.map((topic) => {
          const detail = topicDefinitions[topic.name as PostCategory];
          return (
            <button
              className={styles.topicButton}
              key={topic.name}
              type="button"
              aria-pressed={category === topic.name}
              onClick={() => selectCategory(topic.name)}
              onPointerMove={updateMagnet}
              onPointerLeave={resetMagnet}
            >
              <span>{detail.index} / {String(topic.count).padStart(2, "0")}</span>
              <strong>{topic.name}</strong>
              <small>{detail.description}</small>
              <b aria-hidden="true">↘</b>
            </button>
          );
        })}
      </div>

      {featuredPost ? (
        <Link
          href={`/articles/${featuredPost.slug}`}
          className={styles.featuredStory}
          onPointerMove={updateFeatureSpotlight}
          onPointerLeave={resetFeatureSpotlight}
        >
          <span className={styles.featuredLabel}>START HERE / 从这里开始</span>
          <span className={styles.featuredCopy}>
            <small>{featuredPost.category} · {featuredPost.readingMinutes} 分钟</small>
            <strong>{featuredPost.title}</strong>
            <span>{featuredPost.summary}</span>
          </span>
          <span className={styles.featuredArrow} aria-hidden="true">↗</span>
        </Link>
      ) : null}

      <div className={styles.filterBar} ref={resultsRef}>
        <div className={styles.searchField}>
          <label htmlFor="article-search">搜索文章 <kbd>/</kbd></label>
          <span className={styles.searchControl}>
            <input
              id="article-search"
              ref={searchRef}
              value={query}
              onChange={(event) => { setQuery(event.target.value); syncUrl({ query: event.target.value }); }}
              onFocus={() => setSearchActive(true)}
              onBlur={() => setSearchActive(false)}
              placeholder="标题、摘要或标签"
              type="search"
            />
            {query ? <button type="button" onClick={() => { setQuery(""); syncUrl({ query: "" }); }} aria-label="清空搜索">清空</button> : null}
          </span>
        </div>
        <div className={styles.resultSummary}>
          <p className={styles.resultCount} aria-live="polite">{tag ? `#${tag}` : category === "全部" ? "全部方向" : category} / {String(filtered.length).padStart(2, "0")} 篇</p>
          {(query || category !== "全部" || tag) ? <button type="button" onClick={resetFilters}>重置筛选</button> : <span>按时间倒序</span>}
        </div>
      </div>

      {filtered.length ? (
        <div className={`${styles.postList} ${styles.articleGrid}`}>
          {filtered.map((post, index) => (
            <article className={styles.postRow} key={post.slug}>
              <Link
                href={`/articles/${post.slug}`}
                className={`${styles.postLink} ${styles.archivePostLink}`}
              >
                <span className={styles.postNumber}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.postMeta}>{post.category}<br />{post.date.replaceAll("-", ".")}</span>
                <span className={styles.postCopy}><strong>{post.title}</strong><small>{post.summary}</small></span>
                <span className={styles.postArrow} aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}><strong>没有找到文章</strong><p>换一个关键词，或清除当前筛选。</p><button type="button" onClick={resetFilters}>显示全部文章</button></div>
      )}
    </section>
  );
}
