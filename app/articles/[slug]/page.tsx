import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPostDate, getAllPosts, getPost } from "@/lib/posts";
import { siteConfig } from "@/lib/site";
import { SiteFooter, SiteHeader } from "../../site-chrome";
import { ShareActions } from "../share-actions";
import styles from "../../site.module.css";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `${siteConfig.url}/articles/${post.slug}` },
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.date,
      authors: [siteConfig.author],
      tags: post.tags,
      url: `${siteConfig.url}/articles/${post.slug}`,
      images: [{ url: `${siteConfig.url}/og.png`, width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.summary, images: [`${siteConfig.url}/og.png`] },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = getAllPosts();
  const post = getPost(slug);
  if (!post) notFound();
  const index = posts.findIndex((item) => item.slug === slug);
  const newer = index > 0 ? posts[index - 1] : undefined;
  const older = index < posts.length - 1 ? posts[index + 1] : undefined;
  const related = posts
    .filter((item) => item.slug !== post.slug)
    .map((item) => ({
      post: item,
      score: (item.category === post.category ? 2 : 0) + item.tags.filter((tag) => post.tags.includes(tag)).length * 3,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
    .slice(0, 3)
    .map((item) => item.post);
  const articleUrl = `${siteConfig.url}/articles/${post.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: articleUrl,
    image: `${siteConfig.url}/og.png`,
    author: { "@type": "Person", name: siteConfig.author, url: siteConfig.github },
    publisher: { "@type": "Person", name: siteConfig.author, url: siteConfig.github },
    keywords: post.tags.join(", "),
    articleSection: post.category,
  };

  return (
    <div id="top" className={styles.siteShell}>
      <SiteHeader />
      <main id="main-content" className={styles.pageMain}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c") }} />
        <div className={styles.articleLayout}>
          {post.tableOfContents.length ? (
            <aside className={styles.articleToc} aria-label="文章目录">
              <p>本文目录</p>
              <ol>{post.tableOfContents.map((item, tocIndex) => <li key={item.id}><a href={`#${item.id}`}><span>{String(tocIndex + 1).padStart(2, "0")}</span>{item.title}</a></li>)}</ol>
            </aside>
          ) : null}
          <article className={styles.article}>
          <Link className={styles.articleBack} href="/articles">← 返回全部文章</Link>
          <header className={styles.articleHeader}>
            <p className={styles.pageKicker}><Link href={`/articles?category=${encodeURIComponent(post.category)}`}>{post.category}</Link></p>
            <h1>{post.title}</h1>
            <div className={styles.articleMeta}>
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
              <span>约 {post.readingMinutes} 分钟阅读</span>
            </div>
            <div className={styles.articleTools}>
              <div className={styles.tagList}>{post.tags.map((tag) => <Link href={`/articles?tag=${encodeURIComponent(tag)}`} key={tag}>#{tag}</Link>)}</div>
              <ShareActions />
            </div>
          </header>
          {post.tableOfContents.length ? (
            <details className={styles.mobileToc}>
              <summary>本文目录 <span>{post.tableOfContents.length} 节</span></summary>
              <ol>{post.tableOfContents.map((item, tocIndex) => <li key={item.id}><a href={`#${item.id}`}><span>{String(tocIndex + 1).padStart(2, "0")}</span>{item.title}</a></li>)}</ol>
            </details>
          ) : null}
          <div className={styles.articleBody} dangerouslySetInnerHTML={{ __html: post.html }} />
          {related.length ? (
            <section className={styles.relatedArticles} aria-labelledby="related-title">
              <p>RELATED / 同主题</p>
              <h2 id="related-title">沿着这个问题<br />继续读</h2>
              <div>{related.map((item) => <Link href={`/articles/${item.slug}`} key={item.slug}><small>{item.category} · {item.readingMinutes} 分钟</small><strong>{item.title}</strong><span>↗</span></Link>)}</div>
            </section>
          ) : null}
          <nav className={styles.articlePager} aria-label="上一篇和下一篇">
            {newer ? <Link href={`/articles/${newer.slug}`}><small>较新一篇</small><strong>{newer.title}</strong></Link> : <span />}
            {older ? <Link href={`/articles/${older.slug}`}><small>较早一篇</small><strong>{older.title}</strong></Link> : <span />}
          </nav>
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
