import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { SiteFooter, SiteHeader } from "../site-chrome";
import styles from "../site.module.css";

export const metadata: Metadata = { title: "关于", description: "关于野路子手记和作者 Liaz。", alternates: { canonical: `${siteConfig.url}/about` } };

export default function AboutPage() {
  return (
    <div id="top" className={styles.siteShell}>
      <SiteHeader />
      <main id="main-content" className={styles.pageMain}>
        <p className={styles.pageKicker}>ABOUT / 关于这里</p>
        <h1 className={styles.pageTitle}>你好，<br />欢迎来坐。</h1>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutPortrait} aria-label="野路子手记识别字卡">
            <span>WILD NOTES<br />SINCE 2026</span>
            <b>你<br />好</b>
            <span className={styles.aboutAuthor}>作者 / LIAZ</span>
            <small>DESIGN / CODE / DAILY LIFE</small>
          </div>
          <div className={styles.aboutCopy}>
            <h2>一份持续更新的公开笔记。</h2>
            <p>野路子手记记录设计、代码和普通生活。这里不把个人做法写成标准答案；每篇文章会尽量说明过程、依据、限制，以及仍未解决的问题。</p>
            <p>目前的文章和网站源码都公开在 GitHub。如果发现错字、失效链接或技术问题，可以在仓库中提交 Issue。</p>
            <hr />
            <p><strong>项目仓库</strong><br /><a href={siteConfig.repository} target="_blank" rel="noreferrer" aria-label="打开 BlogLiaz 的 GitHub 仓库（新窗口）">github.com/li-j-h/BlogLiaz ↗</a></p>
            <p><strong>隐私说明</strong><br />本站当前不设置账户、不主动收集个人资料，也不使用广告追踪。详细内容请查看<Link href="/privacy">隐私页</Link>。</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
