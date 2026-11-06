import { categories, type Song, type Show, type Submission } from "./model.ts";

export type AdminState = {
  songs: Song[];
  shows: Show[];
  submissions: Submission[];
  revision: string;
};
type SubmissionChange =
  | { id: string; action: "status"; status: Submission["status"] }
  | { id: string; action: "anonymize" | "delete" };
export type AdminChanges = {
  songs: Song[];
  shows: Show[] | null;
  submissions: SubmissionChange[];
};
const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("資料格式不正確。");
  return value as Record<string, unknown>;
};
function string(value: unknown, max = 2000) {
  if (typeof value !== "string" || value.length > max)
    throw new Error("欄位內容不正確。");
  return value;
}
export function parseSong(value: unknown): Song {
  const s = object(value);
  const category = string(s.category, 20);
  const era = string(s.era ?? "", 20);
  if (!["", "2010 年以前", "2010 年起"].includes(era)) throw new Error("歌曲年代不正確。");
  if (category && !categories.includes(category as (typeof categories)[number]))
    throw new Error("歌曲分類不正確。");
  for (const key of ["ready", "showcase", "serious", "opener"])
    if (typeof s[key] !== "boolean") throw new Error("歌曲標籤不正確。");
  const id = string(s.id, 80),
    title = string(s.title, 160);
  if (!id || !title) throw new Error("歌曲缺少識別碼或名稱。");
  return {
    id,
    title,
    artist: string(s.artist, 100),
    category: category as Song["category"],
    era: era as Song["era"],
    ready: s.ready as boolean,
    showcase: s.showcase as boolean,
    serious: s.serious as boolean,
    opener: s.opener as boolean,
  };
}
export function parseShow(value: unknown): Show {
  const s = object(value);
  const status = string(s.status, 15),
    mode = string(s.mode, 10),
    date = string(s.date, 30);
  if (
    !["draft", "next", "current", "performed"].includes(status) ||
    !["oldies", "artist"].includes(mode) ||
    !Number.isSafeInteger(s.sequence) ||
    Number(s.sequence) < 1 ||
    !Array.isArray(s.items) ||
    s.items.length > 100 ||
    !Array.isArray(s.overrideWarnings) ||
    s.overrideWarnings.length > 100
  )
    throw new Error("場次資料不正確。");
  if (
    status !== "draft" &&
    (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(date + "+08:00")))
  )
    throw new Error("已發布場次需要有效日期與時間。");
  const id = string(s.id, 80),
    location = string(s.location, 300);
  if (!id || (status !== "draft" && !location.trim()))
    throw new Error("場次缺少識別碼或地點。");
  return {
    id,
    sequence: Number(s.sequence),
    date,
    location,
    copy: string(s.copy, 2000),
    mode: mode as Show["mode"],
    artist: string(s.artist, 100),
    status: status as Show["status"],
    overrideWarnings: s.overrideWarnings.map((v) => string(v, 300)),
    items: s.items.map((value) => {
      const item = object(value);
      const slot = string(item.slot, 20);
      if (!["台文", "英文", "中國歌", "專題", "機動"].includes(slot))
        throw new Error("歌單配置不正確。");
      return {
        song: parseSong(item.song),
        slot: slot as Show["items"][number]["slot"],
      };
    }),
  };
}
export function parseChanges(value: unknown): AdminChanges {
  const c = object(value);
  if (
    !Array.isArray(c.songs) ||
    c.songs.length > 500 ||
    !Array.isArray(c.submissions) ||
    c.submissions.length > 10000 ||
    (c.shows !== null && (!Array.isArray(c.shows) || c.shows.length > 1000))
  )
    throw new Error("修改範圍過大或格式不正確。");
  const shows = c.shows === null ? null : (c.shows as unknown[]).map(parseShow);
  if (
    shows &&
    (["current", "next"].some(
      (status) => shows.filter((s) => s.status === status).length > 1,
    ) ||
      new Set(shows.map((s) => s.id)).size !== shows.length)
  )
    throw new Error("只能有一場本場演出與一場下一場預告。");
  return {
    songs: c.songs.map(parseSong),
    shows,
    submissions: c.submissions.map((value) => {
      const r = object(value),
        id = string(r.id, 80);
      if (r.action === "delete" || r.action === "anonymize")
        return { id, action: r.action };
      if (
        r.action === "status" &&
        ["待處理", "處理中", "已完成"].includes(String(r.status))
      )
        return {
          id,
          action: "status",
          status: r.status as Submission["status"],
        };
      throw new Error("互動修改操作不正確。");
    }),
  };
}
export function changesSince(
  before: AdminState,
  after: Pick<AdminState, "songs" | "shows" | "submissions">,
): AdminChanges {
  const originals = new Map(before.songs.map((s) => [s.id, s]));
  const current = new Map(after.submissions.map((s) => [s.id, s]));
  const changes: SubmissionChange[] = [];
  for (const old of before.submissions) {
    const item = current.get(old.id);
    if (!item) changes.push({ id: old.id, action: "delete" });
    else if (
      item.nickname === "已匿名" &&
      !item.email &&
      !item.instagram &&
      !item.message &&
      (old.nickname !== item.nickname ||
        old.email ||
        old.instagram ||
        old.message)
    )
      changes.push({ id: old.id, action: "anonymize" });
    if (item && item.status !== old.status)
      changes.push({ id: item.id, action: "status", status: item.status });
  }
  return {
    songs: after.songs.filter(
      (s) => JSON.stringify(s) !== JSON.stringify(originals.get(s.id)),
    ),
    shows:
      JSON.stringify(before.shows) === JSON.stringify(after.shows)
        ? null
        : after.shows,
    submissions: changes,
  };
}
export function decodeAdmin(value: unknown): AdminState {
  const result = object(value);
  if (
    !Array.isArray(result.songs) ||
    !Array.isArray(result.shows) ||
    !Array.isArray(result.submissions)
  )
    throw new Error("無法讀取管理資料。");
  return {
    revision: string(result.revision, 64),
    songs: result.songs
      .filter((r) => Array.isArray(r) && r[0] && r[1])
      .map((r) =>
        parseSong({
          id: String(r[0]),
          title: String(r[1]),
          artist: String(r[2] ?? ""),
          category: String(r[3] ?? ""),
          era: String(r[17] ?? ""),
          serious: r[4] === "是",
          showcase: r[5] === "是",
          opener: r[6] === "是",
          ready: r[7] === "是",
        }),
      ),
    shows: result.shows.map(parseShow),
    submissions: result.submissions
      .filter((r) => Array.isArray(r) && r[0])
      .map((r) => ({
        id: String(r[0]),
        createdAt: new Date(r[1]).toISOString(),
        kind: r[2],
        topic: r[3] || undefined,
        nickname: String(r[4] ?? ""),
        email: String(r[5] ?? ""),
        instagram: String(r[6] ?? ""),
        title: String(r[7] ?? ""),
        artist: String(r[8] ?? ""),
        message: String(r[9] ?? ""),
        replyConsent: true,
        subscriptionConsent: r[11] === "是",
        status: r[13],
        notification: String(r[14] ?? ""),
      })),
  };
}
