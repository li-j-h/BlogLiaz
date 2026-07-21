export const topicDefinitions = {
  "前端": { index: "01", description: "界面、体验与部署" },
  "爬虫": { index: "02", description: "采集、清洗与稳定性" },
  "AI": { index: "03", description: "模型应用与工程实践" },
  "随笔": { index: "04", description: "偶尔记录普通生活" },
} as const;

export type PostCategory = keyof typeof topicDefinitions;

export const topicOrder = Object.keys(topicDefinitions) as PostCategory[];

export function isPostCategory(value: string): value is PostCategory {
  return Object.prototype.hasOwnProperty.call(topicDefinitions, value);
}
