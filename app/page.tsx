import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { formatPostDate, getAllPosts } from "@/lib/posts";
import { SiteFooter, SiteHeader } from "./site-chrome";
import { HeroDepth } from "./hero-depth";
import styles from "./site.module.css";

const notes = [
  ["07.16", "文章归档加入技术方向导航、推荐阅读与鼠标响应。"],
  ["07.16", "补充前端、爬虫与 AI 工程文章，技术主线现在更清楚。"],
  ["07.12", "文章改用 Markdown 管理，更新会自动进入 RSS 与站点地图。"],
];

const marqueePhrases = ["写下经验", "保留好奇", "持续更新"];
const marqueeCycles = Array.from({ length: 4 });

function MarqueeGroup() {
  return (
    <div className={styles.marqueeGroup}>
      {marqueeCycles.flatMap((_, cycle) =>
        marqueePhrases.map((phrase) => (
          <span className={styles.marqueeItem} key={`${cycle}-${phrase}`}>
            <span>{phrase}</span>
            <b>✦</b>
          </span>
        )),
      )}
    </div>
  );
}

export const metadata: Metadata = { alternates: { canonical: siteConfig.url } };

export default function Home() {
  const featuredPosts = getAllPosts().slice(0, 3);

  return (
    <div id="top" className={styles.siteShell}>
      <SiteHeader />
      <main id="main-content">
        <section className={styles.hero} aria-labelledby="hero-title">
          <p className={`${styles.eyebrow} ${styles.enterOne}`}>个人博客 / 记录正在发生的事</p>
          <h1 id="hero-title" className={`${styles.heroTitle} ${styles.enterTwo}`}>
            <span lang="zh-CN">野路子</span>
            <span lang="zh-CN" className={styles.heroAccent}>手记</span>
          </h1>
          <div className={`${styles.heroFoot} ${styles.enterThree}`}>
            <p>关于前端、爬虫与 AI 工程。<br />偶尔也记录普通生活。</p>
            <a className={styles.roundLink} href="#featured" aria-label="向下查看精选文章">向下<br />阅读</a>
          </div>
          <HeroDepth />
        </section>

        <div className={styles.marquee} role="img" aria-label="博客主题：写下经验，保留好奇，持续更新">
          <div className={styles.marqueeTrack} aria-hidden="true">
            <MarqueeGroup />
            <MarqueeGroup />
          </div>
        </div>

        <section id="featured" className={`${styles.section} ${styles.revealSection}`} aria-labelledby="featured-title">
          <div className={styles.sectionIntro}>
            <p className={styles.sectionNumber}>01 / ARTICLES</p>
            <h2 id="featured-title">最近写下的<br />三件事</h2>
            <Link className={styles.textLink} href="/articles">查看全部文章 →</Link>
          </div>
          <div className={styles.postList}>
            {featuredPosts.map((post, index) => (
              <article className={styles.postRow} key={post.slug}>
                <Link href={`/articles/${post.slug}`} className={styles.postLink}>
                  <span className={styles.postNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.postMeta}>{post.category}<br />{formatPostDate(post.date)}</span>
                  <span className={styles.postCopy}>
                    <strong>{post.title}</strong>
                    <small>{post.summary}</small>
                  </span>
                  <span className={styles.postArrow} aria-hidden="true">↗</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.notesSection} ${styles.revealSection}`} aria-labelledby="notes-title">
          <div className={styles.sectionIntro}>
            <p className={styles.sectionNumber}>02 / CHANGELOG</p>
            <h2 id="notes-title">最近更新</h2>
            <p className={styles.sectionDescription}>记录已经完成的站点改动。</p>
          </div>
          <div className={styles.noteBoard}>
            {notes.map(([date, text], index) => (
              <article className={styles.note} key={`${date}-${index}`} style={{ "--note-index": index } as React.CSSProperties}>
                <time dateTime={`2026-${date.replace(".", "-")}`}>{date}</time>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.aboutTeaser} ${styles.revealSection}`} aria-labelledby="about-title">
          <p className={styles.sectionNumber}>03 / ABOUT</p>
          <h2 id="about-title">先把问题记清楚，<br />再谈答案。</h2>
          <div>
            <p>这里是一份公开笔记，也是一场长期练习。文章会尽量写清过程、依据和适用范围。</p>
            <Link className={styles.solidLink} href="/about">认识这个博客 <span>→</span></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
