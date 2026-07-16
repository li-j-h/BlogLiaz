import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { BackToTop, PrimaryNavigation } from "./interactive-chrome";
import styles from "./site.module.css";

export function SiteHeader() {
  return (
    <>
      <a className={styles.skipLink} href="#main-content">跳到正文</a>
      <div className={styles.scrollProgress} aria-hidden="true" />
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="野路子手记首页">
          <span>野</span><span>路</span><span>子</span>
        </Link>
        <PrimaryNavigation />
        <span className={styles.headerMark}>LIAZ</span>
      </header>
      <BackToTop />
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div>
        <p>野路子手记</p>
        <small>KEEP CURIOUS, KEEP NOTES.</small>
      </div>
      <nav aria-label="页脚导航">
        <Link href="/articles">全部文章</Link>
        <Link href="/resources">资源</Link>
        <Link href="/about">关于</Link>
        <Link href="/privacy">隐私</Link>
        <a href={`${siteConfig.basePath}/rss.xml`}>RSS</a>
        <a href={siteConfig.repository} target="_blank" rel="noreferrer">GitHub</a>
      </nav>
      <p className={styles.copyright}>© 2026 / MADE WITH CURIOSITY</p>
    </footer>
  );
}
