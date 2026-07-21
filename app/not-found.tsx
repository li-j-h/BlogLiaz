import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { SiteFooter, SiteHeader } from "./site-chrome";
import styles from "./site.module.css";

export default function NotFound() {
  const recentPosts = getAllPosts().slice(0, 3);
  return (
    <div id="top" className={styles.siteShell}>
      <SiteHeader />
      <main id="main-content" className={styles.notFound}>
        <strong aria-hidden="true">404</strong>
        <h1>这条路还没有内容</h1>
        <p>可能是地址写错了，也可能这篇文章正在路上。可以回到归档搜索，或从最近文章继续。</p>
        <div className={styles.notFoundActions}><Link href="/articles">搜索全部文章</Link><Link href="/">回到首页</Link></div>
        <section aria-labelledby="not-found-recent"><h2 id="not-found-recent">最近更新</h2><div>{recentPosts.map((post) => <Link href={`/articles/${post.slug}`} key={post.slug}><small>{post.category}</small><span>{post.title}</span><b aria-hidden="true">↗</b></Link>)}</div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
