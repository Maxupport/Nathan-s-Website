export const categories = [
  "台文",
  "華文",
  "英文",
  "中國歌",
  "老歌",
  "其他",
] as const;
export type Category = (typeof categories)[number];
export type Song = {
  id: string;
  title: string;
  artist: string;
  category: Category;
  ready: boolean;
  showcase: boolean;
  serious: boolean;
  opener: boolean;
};
export type Mode = "oldies" | "artist";
export type Slot = "台文" | "英文" | "中國歌" | "專題" | "機動";
export type Item = { song: Song; slot: Slot };
export type Show = {
  id: string;
  sequence: number;
  date: string;
  location: string;
  copy: string;
  mode: Mode;
  artist: string;
  items: Item[];
  status: "draft" | "next" | "performed";
  overrideWarnings: string[];
};
export type Kind = "點歌" | "提問" | "訂閱" | "聯絡" | "鼓勵";
export const conversationTopics = [
  "人生職涯",
  "聲音優化",
  "創業想法",
  "保險評估",
] as const;
export type ConversationTopic = (typeof conversationTopics)[number];
export type Submission = {
  id: string;
  kind: Kind;
  topic?: ConversationTopic;
  nickname: string;
  email: string;
  instagram: string;
  title: string;
  artist: string;
  message: string;
  replyConsent: true;
  subscriptionConsent: boolean;
  createdAt: string;
  status: "待處理" | "處理中" | "已完成";
  notification: "尚未排入" | "Email 待串接" | "IG 待手動通知" | "無聯絡方式";
};

// Deliberately independent demo classifications. Never synchronizes to the owner's Sheet.
const seed: Array<[string, string, Category]> = [
  ["長途夜車", "滅火器", "台文"],
  ["島嶼天光", "滅火器", "台文"],
  ["愛情恰恰", "陳小雲", "台文"],
  ["家後", "江蕙", "台文"],
  ["浪子回頭", "茄子蛋", "台文"],
  ["愛拚才會贏", "葉啟田", "台文"],
  ["Stand by Me", "Ben E. King", "英文"],
  ["Yesterday", "The Beatles", "英文"],
  ["Let It Be", "The Beatles", "英文"],
  ["Perfect", "Ed Sheeran", "英文"],
  ["Can't Help Falling in Love", "Elvis Presley", "英文"],
  ["Hey Jude", "The Beatles", "英文"],
  ["演員", "薛之謙", "中國歌"],
  ["紳士", "薛之謙", "中國歌"],
  ["我好像在哪見過你", "薛之謙", "中國歌"],
  ["剛剛好", "薛之謙", "中國歌"],
  ["醜八怪", "薛之謙", "中國歌"],
  ["認真的雪", "薛之謙", "中國歌"],
  ["月亮代表我的心", "鄧麗君", "老歌"],
  ["甜蜜蜜", "鄧麗君", "老歌"],
  ["我只在乎你", "鄧麗君", "老歌"],
  ["小城故事", "鄧麗君", "老歌"],
  ["但願人長久", "鄧麗君", "老歌"],
  ["夜來香", "鄧麗君", "老歌"],
  ["新不了情", "萬芳", "老歌"],
  ["後來", "劉若英", "老歌"],
  ["朋友", "周華健", "老歌"],
  ["紅豆", "王菲", "老歌"],
  ["吻別", "張學友", "老歌"],
  ["祝福", "張學友", "老歌"],
  ["末班車", "蕭煌奇", "華文"],
  ["記得回來", "韋禮安", "華文"],
  ["最近", "李聖傑", "華文"],
  ["雨天", "孫燕姿", "華文"],
];
export const demoSongs: Song[] = seed.map(
  ([title, artist, category], index) => ({
    id: `demo-${index + 1}`,
    title,
    artist,
    category,
    ready: true,
    showcase: [0, 8, 12, 18, 24, 30].includes(index),
    serious: index % 3 === 0,
    opener: index % 5 === 0,
  }),
);

export const slots: Slot[] = [
  "台文",
  "台文",
  "英文",
  "英文",
  "中國歌",
  "中國歌",
  "專題",
  "專題",
  "專題",
  "專題",
  "專題",
  "機動",
];
function fits(song: Song, slot: Slot, mode: Mode, artist: string) {
  if (slot === "機動") return true;
  if (slot === "專題")
    return mode === "oldies"
      ? song.category === "老歌"
      : song.artist.trim() === artist.trim();
  return song.category === slot;
}

// Bipartite matching avoids falsely reporting shortages when topic and category overlap.
export function generate(
  songs: Song[],
  mode: Mode,
  artist: string,
  excluded: string[] = [],
  random = Math.random,
): Item[] {
  const pool = songs
    .filter((s) => s.ready && !excluded.includes(s.id))
    .map((song) => ({ song, order: random() }))
    .sort((a, b) => a.order - b.order)
    .map((x) => x.song);
  function match(forced?: { index: number; song: Song }) {
    const assigned = new Map<string, number>();
    const result = new Map<number, Song>();
    if (forced) {
      assigned.set(forced.song.id, forced.index);
      result.set(forced.index, forced.song);
    }
    function visit(index: number, seen: Set<string>): boolean {
      for (const song of pool) {
        if (
          seen.has(song.id) ||
          song.id === forced?.song.id ||
          !fits(song, slots[index], mode, artist)
        )
          continue;
        seen.add(song.id);
        const previous = assigned.get(song.id);
        if (previous === undefined || visit(previous, seen)) {
          assigned.set(song.id, index);
          result.set(index, song);
          return true;
        }
      }
      return false;
    }
    slots.forEach((_, index) => {
      if (index !== forced?.index) visit(index, new Set());
    });
    return slots.flatMap((slot, index) =>
      result.has(index) ? [{ song: result.get(index)!, slot }] : [],
    );
  }
  let best = match();
  for (const song of pool.filter((s) => s.showcase)) {
    for (let index = 0; index < slots.length; index++) {
      if (!fits(song, slots[index], mode, artist)) continue;
      const attempt = match({ index, song });
      if (attempt.length === slots.length) return attempt;
      if (
        attempt.length > best.length ||
        (attempt.length === best.length && !best.some((i) => i.song.showcase))
      )
        best = attempt;
    }
  }
  return best;
}

export function warnings(
  show: Show,
  songs: Song[],
  excluded: string[] = [],
): string[] {
  const output: string[] = [];
  if (show.items.length !== 12)
    output.push(`總數應為 12 首，目前 ${show.items.length} 首。`);
  for (const slot of [...new Set(slots)]) {
    const expected = slots.filter((s) => s === slot).length;
    const actual = show.items.filter((item) => item.slot === slot).length;
    if (expected !== actual)
      output.push(`${slot}應有 ${expected} 首，目前 ${actual} 首。`);
  }
  if (
    !show.items.some(
      (i) => (songs.find((s) => s.id === i.song.id) ?? i.song).showcase,
    )
  )
    output.push("至少需要 1 首炫技歌曲。");
  if (new Set(show.items.map((i) => i.song.id)).size !== show.items.length)
    output.push("同一場含有重複歌曲。");
  for (const item of show.items) {
    const current = songs.find((s) => s.id === item.song.id);
    if (!current?.ready) output.push(`「${item.song.title}」目前不可上場。`);
    if (!fits(current ?? item.song, item.slot, show.mode, show.artist))
      output.push(`「${item.song.title}」不符合${item.slot}配置。`);
    if (excluded.includes(item.song.id))
      output.push(`「${item.song.title}」在最近三場已演出。`);
  }
  return output;
}

export function previousIds(shows: Show[]): string[] {
  return shows
    .filter((s) => s.status === "performed")
    .sort((a, b) => b.sequence - a.sequence)
    .slice(0, 3)
    .flatMap((s) => s.items.map((i) => i.song.id));
}

export function initialShows(): Show[] {
  return [1, 2].map((sequence) => ({
    id: `show-${sequence}`,
    sequence,
    date: "",
    location: "",
    copy: "帶一首你青春裡的歌，來街角坐坐。",
    mode: "oldies",
    artist: "",
    items: generate(
      sequence === 1
        ? demoSongs
        : [...demoSongs.slice(3), ...demoSongs.slice(0, 3)],
      "oldies",
      "",
      [],
      () => 0.5,
    ),
    status: "draft",
    overrideWarnings: [],
  }));
}
