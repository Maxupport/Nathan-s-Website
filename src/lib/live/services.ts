export const serviceTopics = ["點歌", "保險評估", "創業想法", "聲音優化", "人生職涯", "跟我說話"] as const;
export type ServiceTopic = (typeof serviceTopics)[number];
export type ServiceLink = { topic: ServiceTopic; enabled: boolean; intro: string; label: string; url: string };
export function emptyServices(): ServiceLink[] {
  return serviceTopics.map(topic => ({topic, enabled: false, intro: "", label: "", url: ""}));
}
export function serviceTopic(kind: string, topic?: string): ServiceTopic | undefined {
  const key = topic ?? (kind === "鼓勵" ? "跟我說話" : kind);
  return serviceTopics.find(t => t === key);
}
export function parseServices(value: unknown): ServiceLink[] {
  if (!Array.isArray(value) || value.length !== serviceTopics.length) throw new Error("需要六個主題設定。");
  return serviceTopics.map(topic => {
    const matches = value.filter(v => v && typeof v === "object" && v.topic === topic);
    if (matches.length !== 1) throw new Error("主題不可重複或缺少。");
    const v = matches[0];
    if (typeof v.enabled !== "boolean") throw new Error("顯示開關不正確。");
    const field = (key: string, max: number) => {
      if (typeof v[key] !== "string" || v[key].length > max) throw new Error("文字或網址長度不正確。");
      return v[key].trim();
    };
    const intro = field("intro", 300), label = field("label", 60), raw = field("url", 2000);
    let url = "";
    if (raw) {
      const parsed = new URL(raw);
      if (parsed.protocol !== "https:" || parsed.username || parsed.password) throw new Error("請填入不含帳密的 HTTPS 網址。");
      url = parsed.href;
    }
    if (v.enabled && (!url || !label)) throw new Error("啟用時需要按鈕文字與網址。");
    return {topic, enabled: v.enabled, intro, label, url};
  });
}
export function publicServices(value: unknown): ServiceLink[] {
  return parseServices(value).filter(s => s.enabled && s.url && s.label);
}
