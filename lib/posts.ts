import { marked } from "marked";
import { rawPosts } from "@/content/posts.generated";
import { siteConfig } from "@/lib/site";
import { isPostCategory, type PostCategory } from "@/lib/topics";

export type Post = {
  slug: string;
  title: string;
  date: string;
  category: PostCategory;
  summary: string;
  tags: string[];
  readingMinutes: number;
  featured: boolean;
  published: boolean;
  body: string;
  html: string;
  tableOfContents: { id: string; title: string }[];
};

function parseFrontmatter(source: string) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(source.trim());
  if (!match) throw new Error("文章缺少 frontmatter");

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const index = line.indexOf(":");
    if (index === -1) continue;
    data[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^['\"]|['\"]$/g, "");
  }
  return { data, body: match[2].trim() };
}

function parseTags(value = "") {
  return value.replace(/^\[|\]$/g, "").split(/[,、]/).map((tag) => tag.trim()).filter(Boolean);
}

function createPost(path: string, source: string): Post {
  const { data, body } = parseFrontmatter(source);
  const slug = path.split("/").pop()?.replace(/\.md$/, "") ?? "";
  for (const field of ["title", "date", "category", "summary"] as const) {
    if (!data[field]) throw new Error(`${path} 缺少 ${field}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(Date.parse(`${data.date}T00:00:00Z`))) {
    throw new Error(`${path} 的 date 必须使用 YYYY-MM-DD 格式`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`${path} 的文件名只能使用小写英文、数字和连字符`);
  }
  if (!isPostCategory(data.category)) {
    throw new Error(`${path} 的 category 必须是：前端、爬虫、AI、随笔`);
  }
  const tableOfContents: { id: string; title: string }[] = [];
  const html = (marked.parse(body) as string).replace(/<h2>([\s\S]*?)<\/h2>/g, (heading, content) => {
    const title = content.replace(/<[^>]+>/g, "").trim();
    const id = `section-${tableOfContents.length + 1}`;
    tableOfContents.push({ id, title });
    return heading.replace("<h2>", `<h2 id="${id}">`);
  }).replace(/(href|src)="\/(?!\/)/g, `$1="${siteConfig.basePath}/`);

  return {
    slug,
    title: data.title,
    date: data.date,
    category: data.category,
    summary: data.summary,
    tags: parseTags(data.tags),
    readingMinutes: Number(data.readingMinutes || 4),
    featured: data.featured === "true",
    published: data.published !== "false",
    body,
    html,
    tableOfContents,
  };
}

const posts = Object.entries(rawPosts)
  .map(([file, source]) => createPost(file, source))
  .filter((post) => post.published)
  .sort((a, b) => b.date.localeCompare(a.date));

export function getAllPosts() {
  return posts;
}

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function formatPostDate(date: string) {
  return date.replaceAll("-", ".");
}
