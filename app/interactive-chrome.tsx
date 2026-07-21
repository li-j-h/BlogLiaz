"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site";
import styles from "./site.module.css";

const navigation = [
  { href: "/articles", label: "文章" },
  { href: "/resources", label: "资源" },
  { href: "/about", label: "关于" },
];

export function PrimaryNavigation() {
  const pathname = usePathname();
  const normalizedPath = siteConfig.basePath && pathname.startsWith(siteConfig.basePath)
    ? pathname.slice(siteConfig.basePath.length) || "/"
    : pathname;

  return (
    <nav className={styles.nav} aria-label="主导航">
      {navigation.map((item) => {
        const active = normalizedPath === item.href || normalizedPath.startsWith(`${item.href}/`);
        return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>{item.label}</Link>;
      })}
      <a className={styles.navExternal} href={siteConfig.repository} target="_blank" rel="noreferrer" aria-label="GitHub 仓库（在新窗口打开）">GitHub</a>
    </nav>
  );
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 520);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <a className={styles.backToTop} data-visible={visible} href="#top" aria-label="回到页面顶部" aria-hidden={!visible} tabIndex={visible ? 0 : -1}>
      <span aria-hidden="true">↑</span>
      <small>TOP</small>
    </a>
  );
}
