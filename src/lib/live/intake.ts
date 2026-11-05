import { createHmac } from "node:crypto";

export const replyConsentVersion = "live-reply-v1";
const kinds = ["點歌", "提問", "訂閱", "聯絡", "鼓勵"];
const topics = ["人生職涯", "聲音優化", "創業想法", "保險評估"];
const eventNames = [
  "form_opened",
  "reply_consent_accepted",
  "details_opened",
  "submitted",
];
export type Intake = {
  id: string;
  kind: string;
  topic: string;
  nickname: string;
  email: string;
  instagram: string;
  title: string;
  artist: string;
  message: string;
  replyConsent: true;
  subscriptionConsent: boolean;
  consentVersion: string;
  events: Array<{ name: string; at: string }>;
};

export function parseIntake(value: unknown): Intake {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("請檢查表單內容。");
  const data = value as Record<string, unknown>;
  const text = (key: string, max: number) => {
    if (data[key] !== undefined && typeof data[key] !== "string")
      throw new Error("欄位格式不正確。");
    const result = String(data[key] ?? "").trim();
    if (result.length > max) throw new Error("內容超過長度限制。");
    return result;
  };
  const id = text("id", 36);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    )
  )
    throw new Error("提交識別碼不正確。");
  const kind = text("kind", 8);
  const topic = text("topic", 20);
  const email = text("email", 254);
  const instagram = text("instagram", 100);
  const title = text("title", 160);
  const artist = text("artist", 100);
  const message = text("message", 2000);
  if (
    !kinds.includes(kind) ||
    (topic && (!topics.includes(topic) || kind !== "提問"))
  )
    throw new Error("互動主題不正確。");
  if (data.replyConsent !== true || data.consentVersion !== replyConsentVersion)
    throw new Error("請確認本次回覆同意。");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("請填寫有效的 Email。");
  if (["提問", "聯絡"].includes(kind) && !email && !instagram)
    throw new Error("請留下 Email 或 Instagram。");
  if (kind === "點歌" && (!title || !artist))
    throw new Error("請填寫歌曲名稱與演唱者。");
  if (["提問", "聯絡", "鼓勵"].includes(kind) && !message)
    throw new Error("請填寫留言內容。");
  if (kind === "訂閱" && (!email || data.subscriptionConsent !== true))
    throw new Error("訂閱需要 Email 及獨立同意。");
  if (
    data.subscriptionConsent !== undefined &&
    typeof data.subscriptionConsent !== "boolean"
  )
    throw new Error("同意格式不正確。");
  const rawEvents = data.events ?? [];
  if (!Array.isArray(rawEvents) || rawEvents.length > 12)
    throw new Error("互動紀錄格式不正確。");
  const events = rawEvents.map((event: unknown) => {
    if (!event || typeof event !== "object")
      throw new Error("互動紀錄格式不正確。");
    const item = event as Record<string, unknown>;
    if (
      typeof item.name !== "string" ||
      !eventNames.includes(item.name) ||
      typeof item.at !== "string" ||
      !Number.isFinite(Date.parse(item.at))
    )
      throw new Error("互動紀錄格式不正確。");
    return { name: item.name, at: new Date(item.at).toISOString() };
  });
  return {
    id,
    kind,
    topic,
    nickname: text("nickname", 60),
    email,
    instagram,
    title,
    artist,
    message,
    replyConsent: true,
    subscriptionConsent: kind === "訂閱" && data.subscriptionConsent === true,
    consentVersion: replyConsentVersion,
    events,
  };
}

export function signBridgePayload(
  payload: string,
  timestamp: number,
  secret: string,
) {
  return createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");
}

export async function writeIntake(
  intake: Intake,
  config: { url: string; secret: string },
  transport: typeof fetch = fetch,
) {
  const url = new URL(config.url);
  if (
    url.origin !== "https://script.google.com" ||
    !/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname) ||
    url.search ||
    config.secret.length < 32
  )
    throw new Error("Sheets bridge is not configured");
  const timestamp = Date.now();
  const payload = JSON.stringify({ operation: "submit", submission: intake });
  const signature = signBridgePayload(payload, timestamp, config.secret);
  const response = await transport(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timestamp, payload, signature }),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
    redirect: "follow",
  });
  if (!response.ok) throw new Error("Sheets write failed");
  const result: unknown = await response.json();
  if (!result || typeof result !== "object")
    throw new Error("Invalid Sheets receipt");
  const receipt = result as Record<string, unknown>;
  if (
    receipt.ok !== true ||
    receipt.id !== intake.id ||
    typeof receipt.savedAt !== "string" ||
    !Number.isFinite(Date.parse(receipt.savedAt))
  )
    throw new Error("Sheet did not confirm persistence");
  return {
    id: intake.id,
    savedAt: receipt.savedAt,
    duplicate: receipt.duplicate === true,
  };
}
