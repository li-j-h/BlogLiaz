"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ResourceCategory, ResourceItem } from "@/lib/resources";
import styles from "./resources.module.css";

const categories: Array<"全部" | ResourceCategory> = ["全部", "前端", "爬虫", "AI", "工具"];
const savedStorageKey = "liaz-resource-shelf";

export function ResourceExplorer({ resources }: { resources: ResourceItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"全部" | ResourceCategory>("全部");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedReady, setSavedReady] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [spotlightId, setSpotlightId] = useState<string | null>(null);
  const [randomStatus, setRandomStatus] = useState("");
  const pointerFrame = useRef<number | null>(null);
  const pointerPosition = useRef({ x: 0, y: 0 });
  const copiedTimer = useRef<number | null>(null);
  const spotlightTimer = useRef<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = JSON.parse(window.localStorage.getItem(savedStorageKey) ?? "[]");
        setSavedIds(Array.isArray(stored) ? stored.filter((value): value is string => typeof value === "string") : []);
      } catch {
        setSavedIds([]);
      } finally {
        setSavedReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

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
    if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
    if (spotlightTimer.current !== null) window.clearTimeout(spotlightTimer.current);
  }, []);

  const filteredResources = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("zh-CN");
    return resources.filter((resource) => {
      const matchesCategory = category === "全部" || resource.category === category;
      const matchesSaved = !savedOnly || savedIds.includes(resource.id);
      const haystack = [resource.title, resource.source, resource.note, resource.category, resource.format, ...resource.tags]
        .join(" ")
        .toLocaleLowerCase("zh-CN");
      return matchesCategory && matchesSaved && (!keyword || haystack.includes(keyword));
    });
  }, [category, query, resources, savedIds, savedOnly]);

  const featuredResources = resources.filter((resource) => resource.featured).slice(0, 3);

  function moveResourceField(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const target = event.currentTarget;
    const bounds = target.getBoundingClientRect();
    pointerPosition.current = {
      x: (event.clientX - bounds.left) / bounds.width - 0.5,
      y: (event.clientY - bounds.top) / bounds.height - 0.5,
    };
    if (pointerFrame.current !== null) return;
    pointerFrame.current = requestAnimationFrame(() => {
      const { x, y } = pointerPosition.current;
      target.style.setProperty("--field-x", `${(x * 9).toFixed(2)}deg`);
      target.style.setProperty("--field-y", `${(-y * 7).toFixed(2)}deg`);
      target.style.setProperty("--drift-x", `${(x * 18).toFixed(1)}px`);
      target.style.setProperty("--drift-y", `${(y * 14).toFixed(1)}px`);
      pointerFrame.current = null;
    });
  }

  function resetResourceField(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current);
    pointerFrame.current = null;
    event.currentTarget.style.setProperty("--field-x", "0deg");
    event.currentTarget.style.setProperty("--field-y", "0deg");
    event.currentTarget.style.setProperty("--drift-x", "0px");
    event.currentTarget.style.setProperty("--drift-y", "0px");
  }

  function toggleSaved(resourceId: string) {
    setSavedIds((current) => {
      const next = current.includes(resourceId) ? current.filter((id) => id !== resourceId) : [...current, resourceId];
      try {
        window.localStorage.setItem(savedStorageKey, JSON.stringify(next));
      } catch {
        // The resource remains usable when browser storage is unavailable.
      }
      return next;
    });
  }

  async function copyResource(resource: ResourceItem) {
    try {
      await navigator.clipboard.writeText(resource.url);
      setCopiedId(resource.id);
      if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      setCopiedId(null);
    }
  }

  function pickRandomResource() {
    const pool = resources.length > 1 ? resources.filter((resource) => resource.id !== spotlightId) : resources;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    setQuery("");
    setCategory("全部");
    setSavedOnly(false);
    setSpotlightId(picked.id);
    setRandomStatus(`已随机选中：${picked.title}`);
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const row = document.getElementById(`resource-${picked.id}`);
      row?.scrollIntoView({ behavior, block: "center" });
      row?.querySelector<HTMLAnchorElement>("h3 a")?.focus({ preventScroll: true });
    }));
    if (spotlightTimer.current !== null) window.clearTimeout(spotlightTimer.current);
    spotlightTimer.current = window.setTimeout(() => setSpotlightId(null), 2400);
  }

  function resetFilters() {
    setQuery("");
    setCategory("全部");
    setSavedOnly(false);
  }

  const savedLabel = savedReady ? String(savedIds.length).padStart(2, "0") : "··";

  return (
    <div className={styles.resourcePage}>
      <section className={styles.resourceHero} aria-labelledby="resource-title">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>RESOURCE FIELD / CURATED BY LIAZ</p>
          <h1 id="resource-title"><span>资源</span><span>工作台</span></h1>
          <p className={styles.heroIntro}>写文章时查过、准备深入阅读，或值得留在手边的技术资料，都收进这里。</p>
          <div className={styles.heroActions}>
            <a href="#resource-index">开始查找 <span aria-hidden="true">↓</span></a>
            <button type="button" onClick={pickRandomResource}>随机翻一条 <span aria-hidden="true">↗</span></button>
          </div>
        </div>

        <div className={styles.resourceField} onPointerMove={moveResourceField} onPointerLeave={resetResourceField} aria-hidden="true">
          <div className={styles.fieldSheet}>
            <span className={styles.fieldCoordinates}>RESOURCE GRID<br />INDEX 2026</span>
            <span className={`${styles.fieldTag} ${styles.fieldTagFront}`}>FRONTEND</span>
            <span className={`${styles.fieldTag} ${styles.fieldTagCrawler}`}>CRAWLER</span>
            <span className={`${styles.fieldTag} ${styles.fieldTagAi}`}>AI LAB</span>
            <span className={`${styles.fieldTag} ${styles.fieldTagTools}`}>TOOLS</span>
            <strong>LIAZ</strong>
            <small>FIELD NOTES<br />NO. 001</small>
          </div>
        </div>
      </section>

      <section className={styles.resourceStats} aria-label="资源统计">
        <p><strong>{String(resources.length).padStart(2, "0")}</strong><span>已收录</span></p>
        {(["前端", "爬虫", "AI"] as ResourceCategory[]).map((name) => (
          <p key={name}><strong>{String(resources.filter((item) => item.category === name).length).padStart(2, "0")}</strong><span>{name}</span></p>
        ))}
      </section>

      <section className={styles.liazPicks} aria-labelledby="liaz-picks-title">
        <div className={styles.sectionLabel}>
          <p>01 / LIAZ PICKS</p>
          <h2 id="liaz-picks-title">先放进<br />工具箱</h2>
        </div>
        <div className={styles.pickList}>
          {featuredResources.map((resource, index) => (
            <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" aria-label={`${resource.title}（新窗口打开）`}>
              <span>{String(index + 1).padStart(2, "0")} / {resource.category}</span>
              <strong>{resource.title}</strong>
              <small>{resource.note}</small>
              <b aria-hidden="true">↗</b>
            </a>
          ))}
        </div>
      </section>

      <section id="resource-index" className={styles.resourceIndex} aria-labelledby="resource-index-title">
        <div className={styles.sectionLabel}>
          <p>02 / RESOURCE INDEX</p>
          <h2 id="resource-index-title">按问题<br />找资料</h2>
          <p className={styles.indexNote}>收藏只保存在当前设备，不需要登录。</p>
        </div>

        <div className={styles.indexMain}>
          <div className={styles.resourceControls}>
            <div className={styles.resourceSearch}>
              <label htmlFor="resource-search">搜索资源 <kbd>/</kbd></label>
              <span>
                <input
                  id="resource-search"
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="技术、问题或来源"
                />
                {query ? <button type="button" onClick={() => setQuery("")} aria-label="清空资源搜索">清空</button> : null}
              </span>
            </div>

            <div className={styles.categoryFilters} role="group" aria-label="资源分类">
              {categories.map((name) => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={category === name && !savedOnly}
                  onClick={() => { setCategory(name); setSavedOnly(false); }}
                >
                  <span>{name}</span>
                  <small>{name === "全部" ? resources.length : resources.filter((item) => item.category === name).length}</small>
                </button>
              ))}
              <button
                type="button"
                aria-pressed={savedOnly}
                aria-busy={!savedReady}
                onClick={() => setSavedOnly((current) => !current)}
              >
                <span>收藏夹</span><small>{savedLabel}</small>
              </button>
            </div>

            <div className={styles.resultLine}>
              <p aria-live="polite">{savedOnly ? "收藏夹" : category} / {String(filteredResources.length).padStart(2, "0")} 条</p>
              {(query || category !== "全部" || savedOnly) ? <button type="button" onClick={resetFilters}>重置</button> : <span>持续补充中</span>}
            </div>
            <span className={styles.copyStatus} role="status" aria-live="polite">{copiedId ? "链接已复制" : ""}</span>
            <span className={styles.copyStatus} role="status" aria-live="polite">{randomStatus}</span>
          </div>

          {!savedReady && savedOnly ? (
            <div className={styles.resourcePending} role="status">正在读取这台设备上的收藏…</div>
          ) : filteredResources.length ? (
            <div className={styles.resourceList}>
              {filteredResources.map((resource, index) => {
                const saved = savedIds.includes(resource.id);
                return (
                  <article
                    id={`resource-${resource.id}`}
                    className={styles.resourceRow}
                    data-category={resource.category}
                    data-spotlight={spotlightId === resource.id}
                    key={resource.id}
                  >
                    <span className={styles.resourceNumber}>{String(index + 1).padStart(2, "0")}</span>
                    <div className={styles.resourceCopy}>
                      <p><span>{resource.category}</span><span>{resource.format}</span><span>{resource.source}</span></p>
                      <h3><a href={resource.url} target="_blank" rel="noreferrer" aria-label={`${resource.title}（新窗口打开）`}>{resource.title} <span aria-hidden="true">↗</span></a></h3>
                      <p>{resource.note}</p>
                      <ul aria-label="标签">{resource.tags.map((tag) => <li key={tag}>#{tag}</li>)}</ul>
                    </div>
                    <div className={styles.resourceActions}>
                      <button type="button" aria-pressed={saved} onClick={() => toggleSaved(resource.id)}>
                        <span aria-hidden="true">{saved ? "★" : "☆"}</span>{saved ? "已收藏" : "收藏"}
                      </button>
                      <button type="button" onClick={() => copyResource(resource)}>
                        {copiedId === resource.id ? "已复制" : "复制链接"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.resourceEmpty}>
              <strong>{savedOnly ? "收藏夹还是空的" : "没有找到对应资源"}</strong>
              <p>{savedOnly ? "看到想留下的资料，点一下星标就会出现在这里。" : "换一个关键词，或清除当前筛选。"}</p>
              <button type="button" onClick={resetFilters}>查看全部资源</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
