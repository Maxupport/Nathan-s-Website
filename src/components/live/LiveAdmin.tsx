"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  Download,
  GripVertical,
  Inbox,
  ListMusic,
  Music2,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState, useEffect, useEffectEvent, type FormEvent } from "react";
import {
  categories,
  generate,
  drawShowDrafts,
  previousIds,
  warnings,
  transitionShow,
  songKey,
  type Mode,
  type Show,
  type Slot,
  type Song,
} from "@/lib/live/model";
import { useLive } from "./LiveProvider";

type Tab = "shows" | "songs" | "inbox";
const tabs: Array<{ key: Tab; label: string; icon: typeof Inbox }> = [
  { key: "shows", label: "演出與歌單", icon: ListMusic },
  { key: "songs", label: "歌曲資料庫", icon: Music2 },
  { key: "inbox", label: "觀眾收件匣", icon: Inbox },
];
export default function LiveAdmin() {
  const {
    songs,
    setSongs,
    shows,
    setShows,
    submissions,
    setSubmissions,
    managed,
    loaded,
    saving,
    dirty,
    syncMessage,
    refreshAdmin,
    saveAdmin,
  } = useLive();
  const poll = useEffectEvent(() => {
    if (document.visibilityState === "visible") void refreshAdmin();
  });
  useEffect(() => {
    if (!managed) return;
    poll();
    const interval = setInterval(poll, 5000);
    document.addEventListener("visibilitychange", poll);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [managed]);
  const [tab, setTab] = useState<Tab>("shows");
  const [selected, setSelected] = useState("show-1");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("全部");
  const [dragged, setDragged] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [replacement, setReplacement] = useState("");
  const [slot, setSlot] = useState<Slot>("機動");
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [drawMode, setDrawMode] = useState<Mode>("oldies");
  const [drawArtist, setDrawArtist] = useState("");
  const [drawing, setDrawing] = useState(false);
  const show = shows.find((s) => s.id === selected) ?? shows[0];
  const excluded = previousIds(shows);
  const issues = show ? warnings(show, songs, excluded) : [];
  const editable = show?.status === "draft";
  const matches = songs.filter(
    (s) =>
      `${s.title} ${s.artist}`.toLowerCase().includes(search.toLowerCase()) &&
      (category === "全部" || s.category === category),
  );
  function updateShow(change: Partial<Show>) {
    if (show)
      setShows((old) =>
        old.map((s) => (s.id === show.id ? { ...s, ...change } : s)),
      );
    setConfirmPublish(false);
  }
  function move(from: number, to: number) {
    if (!show || !editable || to < 0 || to >= show.items.length) return;
    const items = [...show.items];
    const [item] = items.splice(from, 1);
    items.splice(to, 0, item);
    updateShow({ items });
  }
  function publish() {
    if (!show) return;
    if (!show.date || !show.location.trim()) {
      setNotice("發布前請填寫演出日期、時間與地點。");
      return;
    }
    if (shows.some((s) => s.status === "next" && s.id !== show.id)) {
      setNotice("已有一場下一場預告，請先完成場次切換。");
      return;
    }
    if (issues.length && !confirmPublish) {
      setConfirmPublish(true);
      return;
    }
    const items = show.items.map((item) => ({
      ...item,
      song: { ...(songs.find((s) => s.id === item.song.id) ?? item.song) },
    }));
    updateShow({ status: "next", items, overrideWarnings: issues });
    setSubmissions((old) =>
      old.map((s) =>
        s.kind === "點歌" &&
        items.some(
          (i) =>
            songKey(i.song.title, i.song.artist) === songKey(s.title, s.artist),
        )
          ? {
              ...s,
              notification: s.email
                ? "Email 待串接"
                : s.instagram
                  ? "IG 待手動通知"
                  : "無聯絡方式",
            }
          : s,
      ),
    );
    setConfirmPublish(false);
    setNotice(
      managed
        ? "預告已準備好，請按「儲存修改」後公開。通知尚未寄送。"
        : "Demo 預告已發布，可以切到觀眾頁查看。通知僅建立示例狀態，未實際寄送。",
    );
  }
  async function newShow() {
    if (drawing || saving || (managed && dirty)) return;
    setDrawing(true);
    try {
      const drafts = drawShowDrafts(songs, shows, drawMode, drawArtist);
      const nextShows = [...shows, ...drafts];
      setSelected(drafts[0].id);
      if (managed) {
        const saved = await saveAdmin(nextShows);
        if (!saved) {
          setNotice("歌單已抽出，但尚未確認保存。請保留畫面，按「儲存修改」重試；不要重複建立。");
          return;
        }
      } else setShows(nextShows);
      const incomplete = drafts.some((draft) => warnings(draft, songs, excluded).length);
      setNotice(`已抽出並${managed ? "儲存" : "建立"} ${drafts.length} 份可編輯歌單。${incomplete ? "分類或曲目不足，請查看配置提醒並調整。" : "可以直接調整順序與替換歌曲。"}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "無法建立歌單，請稍後重試。");
    } finally {
      setDrawing(false);
    }
  }
  function addSong(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const song: Song = {
      id: crypto.randomUUID(),
      title: String(data.get("title")).trim(),
      artist: String(data.get("artist")).trim(),
      category: String(data.get("category")) as Song["category"],
      ready: true,
      showcase: false,
      serious: false,
      opener: false,
    };
    if (!song.title || !song.artist) return;
    setSongs((old) => [...old, song]);
    setAdding(false);
    setNotice(
      managed
        ? "歌曲已加入，預設可上場；請儲存修改。"
        : "已加入示例歌庫，預設可上場。",
    );
  }
  async function deleteShow() {
    if (!show || !["draft", "next"].includes(show.status) || saving || drawing) return;
    if (managed && dirty) { setNotice("請先儲存目前修改，再刪除歌單。"); return; }
    if (!window.confirm(`刪除第 ${show.sequence} 場尚未演出的歌單？${show.status === "next" ? "已公開的預告也會移除。" : ""}`)) return;
    const next = shows.filter((s) => s.id !== show.id);
    const saved = managed ? await saveAdmin(next) : (setShows(next), true);
    setSelected(next[0]?.id ?? "");
    setNotice(saved ? "已刪除未演出的歌單。" : "尚未確認刪除成功，請保留畫面並檢查同步訊息。");
  }
  async function downloadRecord(record: string, sequence: number) {
    const image = new Image();
    image.src = record;
    try {
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      canvas.getContext("2d")?.drawImage(image, 0, 0);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png"); link.download = `Maxupport-LIVE-第${sequence}場紀錄.png`; link.click();
    } catch { setNotice("無法下載紀錄圖，請稍後重試。"); }
  }
  function exportCsv() {
    const rows = [
      [
        "類型",
        "聊聊主題",
        "暱稱",
        "Email",
        "Instagram",
        "歌曲",
        "演唱者",
        "內容",
        "狀態",
        "通知",
        "回覆同意",
        "訂閱同意",
        "提交時間",
      ],
      ...submissions.map((s) => [
        s.kind,
        s.topic ?? "",
        s.nickname,
        s.email,
        s.instagram,
        s.title,
        s.artist,
        s.message,
        s.status,
        s.notification,
        "是",
        s.subscriptionConsent ? "是" : "否",
        s.createdAt,
      ]),
    ];
    const safe = (value: string) =>
      `"${(/^[\s]*[=+@\-]/.test(value) ? "'" + value : value).replaceAll('"', '""')}"`;
    const url = URL.createObjectURL(
      new Blob(
        ["\uFEFF", rows.map((row) => row.map(safe).join(",")).join("\r\n")],
        { type: "text/csv;charset=utf-8" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = managed ? "maxupport-live.csv" : "maxupport-live-demo.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  if (managed && !loaded)
    return (
      <main className="live-container live-section">
        <h1>正在讀取私人管理資料</h1>
        <p role="status">{syncMessage || "正在連接 Google Sheet…"}</p>
        <button className="live-button" onClick={() => void refreshAdmin()}>
          重新載入
        </button>
      </main>
    );
  return (
    <div className="live-admin">
      <aside className="live-sidebar">
        <Link href="/live" className="live-logo">
          Maxupport<span>LIVE / STUDIO</span>
        </Link>
        <p className="live-eyebrow">演出前，先把歌準備好。</p>
        <nav aria-label="管理端導覽">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={tab === key ? "active" : ""}
              onClick={() => {
                setTab(key);
                setNotice("");
              }}
            >
              <Icon size={19} />
              {label}
              {key === "inbox" && <small>{submissions.length}</small>}
            </button>
          ))}
        </nav>
        <div className="live-sidebar-bottom">
          <span className="live-pill">
            {managed ? "PRIVATE WORKSPACE" : "DEMO WORKSPACE"}
          </span>
          <p>
            {managed
              ? "已登入 Max 的私人管理端。"
              : "獨立示例歌庫，未同步 Google Sheet。"}
            <br />
            {managed
              ? "資料來源為同一份 Google Sheet。"
              : "尚未啟用登入、永久保存或寄信。"}
            <br />
            {managed
              ? "修改後請儲存，未儲存內容只在本頁。"
              : "重新整理會重設所有操作。"}
          </p>
          {managed && (
            <button
              className="live-text-link"
              onClick={async () => {
                await fetch("/api/live/auth/session", { method: "DELETE" });
                location.replace("/live/admin");
              }}
            >
              登出管理端
            </button>
          )}
          <Link href="/live">
            查看觀眾頁 <ArrowUpRight size={16} />
          </Link>
        </div>
      </aside>
      <main className="live-admin-main">
        <header className="live-admin-header">
          <div>
            <p className="live-eyebrow">MAXUPPORT LIVE / 管理工作室</p>
            <h1>{tabs.find((t) => t.key === tab)?.label}</h1>
          </div>
          <Link href="/live" className="live-button secondary">
            觀眾頁 <ArrowUpRight size={16} />
          </Link>
        </header>
        <div role="status" aria-live="polite">
          {managed && (
            <div className="live-notice">
              <div>
                <p>{syncMessage || "正在讀取 Google Sheet…"}</p>
                <small>
                  {dirty ? "有尚未儲存的修改" : "每 5 秒更新可見頁面"}
                </small>
              </div>
              <button
                className="live-button"
                disabled={!loaded || saving || !dirty}
                onClick={() => void saveAdmin()}
              >
                {saving ? "正在儲存…" : "儲存修改"}
              </button>
              <button
                className="live-button secondary"
                disabled={saving}
                onClick={() => {
                  if (
                    !dirty ||
                    window.confirm("放棄尚未儲存的修改並讀取 Google Sheet？")
                  )
                    void refreshAdmin(true);
                }}
              >
                重新載入
              </button>
            </div>
          )}
          {notice && (
            <div className="live-notice">
              <Check size={18} />
              {notice}
            </div>
          )}
        </div>
        <div className="live-stats">
          <div>
            <small>{managed ? "歌曲資料庫" : "示例歌曲"}</small>
            <strong>
              {songs.length}
              <span>首</span>
            </strong>
          </div>
          <div>
            <small>可上場</small>
            <strong>
              {songs.filter((s) => s.ready).length}
              <span>首</span>
            </strong>
          </div>
          <div>
            <small>待處理互動</small>
            <strong>
              {submissions.filter((s) => s.status === "待處理").length}
              <span>則</span>
            </strong>
          </div>
          <div>
            <small>已完成演出</small>
            <strong>
              {shows.filter((s) => s.status === "performed").length}
              <span>場</span>
            </strong>
          </div>
        </div>
        {tab === "shows" && (
          <>
            <div className="live-workspace-heading">
              <div>
                <h2>每一場，都值得好好準備。</h2>
                <p>先一鍵抽歌建立，再編輯調整。首次建立兩份，之後每次一份。</p>
              </div>
            </div>
            <section className="live-panel live-build-panel" aria-label="一鍵建構歌單">
              <h2>依規則，一鍵建構歌單</h2>
              <p className="live-form-note">台文 2 · 英文 2 · 中國歌 2 · 專題 5 · 機動 1；至少一首炫技，排除最近三場已演出歌曲。分類不足會列出缺口。</p>
              <div className="live-generation">
                <label>新歌單的五首專題
                  <select value={drawMode} disabled={drawing} onChange={(event) => setDrawMode(event.target.value as Mode)}>
                    <option value="oldies">2010 年以前</option>
                    <option value="artist">指定歌手</option>
                  </select>
                </label>
                {drawMode === "artist" && <label>專題歌手<input value={drawArtist} disabled={drawing} placeholder="輸入歌手名稱" onChange={(event) => setDrawArtist(event.target.value)} /></label>}
                <button className="live-button" disabled={drawing || saving || (managed && dirty) || (drawMode === "artist" && !drawArtist.trim())} onClick={() => void newShow()}>
                  <Sparkles size={18} />{drawing ? "正在抽歌與儲存…" : "一鍵抽歌並建立歌單"}
                </button>
              </div>
              <p className="live-form-note">{managed && dirty ? "請先儲存目前的修改，再建立新歌單。" : managed ? "抽出後自動儲存為私人草稿；你調整並發布後，觀眾才會看見。" : "Demo 僅建立本頁草稿。"}</p>
            </section>
            <div className="live-show-tabs" aria-label="選擇場次">
              {shows.map((s) => (
                <button
                  key={s.id}
                  className={show?.id === s.id ? "active" : ""}
                  onClick={() => {
                    setSelected(s.id);
                    setConfirmPublish(false);
                    setConfirmComplete(false);
                    setNotice("");
                  }}
                >
                  第 {s.sequence} 場{" "}
                  <small>
                    {s.status === "draft"
                      ? "草稿"
                      : s.status === "next"
                        ? "已發布"
                        : s.status === "current"
                          ? "演出中"
                          : "已演出"}
                  </small>
                </button>
              ))}
            </div>
            {show && (
              <div className="live-editor-grid">
                <section className="live-panel">
                  <div className="live-panel-heading">
                    <div>
                      <p className="live-eyebrow">
                        SETLIST / {show.items.length} SONGS
                      </p>
                      <h2>第 {show.sequence} 場歌單</h2>
                    </div>
                    <span className="live-pill">
                      {show.status === "draft" ? "可編輯" : "發布快照"}
                    </span>
                  </div>
                  {["draft", "next"].includes(show.status) && <button className="live-button secondary" disabled={saving || drawing || (managed && dirty)} onClick={() => void deleteShow()}><Trash2 size={16} />刪除這份未演出歌單</button>}
                  {show.status === "performed" && <div className="live-notice"><p>已演出紀錄已鎖定，不能修改或刪除。</p>{show.recordImage && <><a href={show.recordImage} target="_blank" rel="noreferrer">檢視演出紀錄圖</a><button className="live-button secondary" onClick={() => void downloadRecord(show.recordImage!, show.sequence)}>下載演出紀錄 PNG</button></>}</div>}
                  <details className="live-redraw">
                  <summary>重新抽選這份草稿（會替換目前歌單）</summary>
                  <div className="live-generation">
                    <label>
                      五首專題
                      <select
                        disabled={!editable}
                        value={show.mode}
                        onChange={(e) =>
                          updateShow({ mode: e.target.value as Mode })
                        }
                      >
                        <option value="oldies">2010 年以前</option>
                        <option value="artist">指定歌手</option>
                      </select>
                    </label>
                    {show.mode === "artist" && (
                      <label>
                        歌手
                        <input
                          disabled={!editable}
                          value={show.artist}
                          placeholder="例如：鄧麗君"
                          onChange={(e) =>
                            updateShow({ artist: e.target.value })
                          }
                        />
                      </label>
                    )}
                    <button
                      disabled={
                        !editable ||
                        (show.mode === "artist" && !show.artist.trim())
                      }
                      className="live-button secondary"
                      onClick={() => {
                        updateShow({
                          items: generate(
                            songs,
                            show.mode,
                            show.artist,
                            excluded,
                          ),
                        });
                        setNotice("已重新抽選；請確認下方配置警告與演出順序。");
                      }}
                    >
                      <Sparkles size={16} />
                      重新抽選
                    </button>
                  </div>
                  </details>
                  <p className="live-form-note">
                    台文 2 · 英文 2 · 中國歌 2 · 專題 5 · 機動
                    1；至少一首炫技。可拖曳，也可用上下按鈕排序。
                  </p>
                  <ol className="live-editor-list">
                    {show.items.map((item, index) => (
                      <li
                        key={`${index}-${item.song.id}`}
                        draggable={editable}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", String(index));
                          setDragged(index);
                        }}
                        onDragEnd={() => setDragged(null)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const from = Number(
                            e.dataTransfer.getData("text/plain"),
                          );
                          if (Number.isInteger(from)) move(from, index);
                          setDragged(null);
                        }}
                        className={dragged === index ? "dragging" : ""}
                      >
                        <GripVertical size={16} aria-hidden="true" />
                        <span className="live-track-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="live-track-name">
                          <strong>{item.song.title}</strong>
                          <small>
                            {item.song.artist}
                            {item.song.showcase ? " · 炫技" : ""}
                          </small>
                        </div>
                        <span className="live-slot">{item.slot}</span>
                        {editable && (
                          <div className="live-track-actions">
                            <button
                              aria-label={`上移 ${item.song.title}`}
                              disabled={index === 0}
                              onClick={() => move(index, index - 1)}
                            >
                              <ArrowUp size={15} />
                            </button>
                            <button
                              aria-label={`下移 ${item.song.title}`}
                              disabled={index === show.items.length - 1}
                              onClick={() => move(index, index + 1)}
                            >
                              <ArrowDown size={15} />
                            </button>
                            <button
                              aria-label={`移除 ${item.song.title}`}
                              onClick={() =>
                                updateShow({
                                  items: show.items.filter(
                                    (_, i) => i !== index,
                                  ),
                                })
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                  {editable && (
                    <div className="live-add-track">
                      <label>
                        加入／替換歌曲
                        <select
                          value={replacement}
                          onChange={(e) => setReplacement(e.target.value)}
                        >
                          <option value="">
                            {managed ? "選擇歌曲" : "選擇示例歌曲"}
                          </option>
                          {songs.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title} — {s.artist}
                              {s.ready ? "" : "（不可上場）"}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        配置
                        <select
                          value={slot}
                          onChange={(e) => setSlot(e.target.value as Slot)}
                        >
                          {["台文", "英文", "中國歌", "專題", "機動"].map(
                            (s) => (
                              <option key={s}>{s}</option>
                            ),
                          )}
                        </select>
                      </label>
                      <button
                        className="live-button secondary"
                        disabled={!replacement}
                        onClick={() => {
                          const song = songs.find((s) => s.id === replacement);
                          if (song)
                            updateShow({
                              items: [
                                ...show.items,
                                { song: { ...song }, slot },
                              ],
                            });
                          setReplacement("");
                        }}
                      >
                        <Plus size={16} />
                        加入
                      </button>
                    </div>
                  )}
                </section>
                <aside className="live-editor-side">
                  <section className="live-panel">
                    <div className="live-panel-heading">
                      <h2>演出預告</h2>
                      <Settings2 size={18} />
                    </div>
                    <div className="live-form">
                      <label>
                        日期與時間（台北）
                        <input
                          type="datetime-local"
                          disabled={!editable}
                          value={show.date}
                          onInput={(e) =>
                            updateShow({ date: e.currentTarget.value })
                          }
                          onChange={(e) => updateShow({ date: e.target.value })}
                        />
                      </label>
                      <label>
                        演出地點
                        <input
                          disabled={!editable}
                          value={show.location}
                          maxLength={200}
                          placeholder="街角、場地與地址"
                          onChange={(e) =>
                            updateShow({ location: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        其他預告文案
                        <textarea
                          disabled={!editable}
                          value={show.copy}
                          maxLength={1000}
                          rows={4}
                          placeholder="這一場想跟大家說的話…"
                          onChange={(e) => updateShow({ copy: e.target.value })}
                        />
                      </label>
                    </div>
                  </section>
                  <section
                    className={`live-validation ${issues.length ? "has-warnings" : ""}`}
                  >
                    <strong>
                      {issues.length
                        ? `${issues.length} 項配置提醒`
                        : "12 首配置檢查通過"}
                    </strong>
                    {issues.length ? (
                      <ul>
                        {issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>可以再調整順序，準備好了就發布。</p>
                    )}
                    {show.overrideWarnings.length > 0 && (
                      <p>
                        此發布版本已確認 {show.overrideWarnings.length} 項警告。
                      </p>
                    )}
                  </section>
                  {editable && (
                    <>
                      <button
                        className="live-button live-full"
                        onClick={publish}
                      >
                        {confirmPublish
                          ? "我已確認警告，仍要發布"
                          : "發布下一場預告"}
                        <ArrowUpRight size={17} />
                      </button>
                      {confirmPublish && (
                        <p className="live-form-note" role="alert">
                          請閱讀上方警告；再次按下按鈕即依目前歌單發布。
                        </p>
                      )}
                    </>
                  )}
                  {show.status === "next" && (
                    <button
                      className="live-button live-full"
                      onClick={() => {
                        try {
                          const updated = transitionShow(
                            shows,
                            show.id,
                            "start",
                          );
                          setShows(updated);
                          setNotice(
                            managed
                              ? "已準備開始本場演出；請儲存修改後公開。可繼續發布下一場預告。"
                              : "已開始本場演出，觀眾頁會優先顯示本場歌單；可繼續發布下一場預告。",
                          );
                        } catch (error) {
                          setNotice((error as Error).message);
                        }
                      }}
                    >
                      開始本場演出 <Music2 size={16} />
                    </button>
                  )}
                  {show.status === "current" && (
                    <>
                      <button
                        className="live-button live-full"
                        onClick={() => {
                          if (!confirmComplete) {
                            setConfirmComplete(true);
                            return;
                          }
                          setShows(transitionShow(shows, show.id, "finish"));
                          setConfirmComplete(false);
                          setNotice(
                            managed
                              ? "已準備將此場移入上一場；請儲存修改。"
                              : "這場已移到上一場歌單。請選擇下一份草稿發布新預告。",
                          );
                        }}
                      >
                        {confirmComplete
                          ? "確認這場已完成"
                          : "演出完成，手動切換"}
                        <Check size={16} />
                      </button>
                      {confirmComplete && (
                        <p className="live-form-note">
                          確認後公開頁會將此場顯示為上一場；其他草稿不會自動發布。
                        </p>
                      )}
                    </>
                  )}
                </aside>
              </div>
            )}
          </>
        )}
        {tab === "songs" && (
          <>
            <div className="live-workspace-heading">
              <div>
                <h2>把熟悉的歌，一首首收好。</h2>
                <p>
                  {managed
                    ? "分類留給你決定；未分類歌曲不會自動套用主題。修改後請儲存至 Google Sheet。"
                    : "以下為獨立示例分類。你正在編輯的 Google Sheet 不受影響。"}
                </p>
              </div>
              <button
                className="live-button"
                onClick={() => setAdding(!adding)}
              >
                <Plus size={17} />
                {managed ? "新增歌曲" : "新增示例歌曲"}
              </button>
            </div>
            {adding && (
              <form className="live-panel live-new-song" onSubmit={addSong}>
                <label>
                  歌曲
                  <input name="title" required maxLength={160} />
                </label>
                <label>
                  演唱者
                  <input name="artist" required maxLength={100} />
                </label>
                <label>
                  主分類
                  <select name="category">
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <button className="live-button">加入歌庫</button>
              </form>
            )}
            <div className="live-toolbar">
              <label className="live-search">
                <Search size={18} />
                <input
                  placeholder="搜尋歌曲或演唱者"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="搜尋歌曲或演唱者"
                />
              </label>
              <select
                aria-label="篩選主分類"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>全部</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <span>{matches.length} 首</span>
            </div>
            <div className="live-table-wrap">
              <table className="live-table">
                <thead>
                  <tr>
                    <th>歌曲／演唱者</th>
                    <th>主分類</th><th>歌曲年代</th>
                    <th>認真演</th>
                    <th>炫技</th>
                    <th>開場＆壓軸</th>
                    <th>可上場</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((song) => (
                    <tr key={song.id}>
                      <td>
                        <strong>{song.title}</strong>
                        <small>{song.artist}</small>
                      </td>
                      <td>
                        <select
                          aria-label={`${song.title}主分類`}
                          value={song.category}
                          onChange={(e) =>
                            setSongs((old) =>
                              old.map((s) =>
                                s.id === song.id
                                  ? {
                                      ...s,
                                      category: e.target
                                        .value as Song["category"],
                                    }
                                  : s,
                              ),
                            )
                          }
                        >
                          <option value="">未分類</option>
                          {categories.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </td>
                      <td><select aria-label={`${song.title}歌曲年代`} value={song.era ?? ""} onChange={(e) => setSongs((old) => old.map((s) => s.id === song.id ? {...s, era: e.target.value as Song["era"]} : s))}><option value="">未標年代</option><option>2010 年以前</option><option>2010 年起</option></select></td>
                      {(
                        ["serious", "showcase", "opener", "ready"] as const
                      ).map((field, i) => (
                        <td key={field}>
                          <input
                            type="checkbox"
                            aria-label={`${song.title}${["認真演", "炫技", "開場＆壓軸", "可上場"][i]}`}
                            checked={song[field]}
                            onChange={(e) =>
                              setSongs((old) =>
                                old.map((s) =>
                                  s.id === song.id
                                    ? { ...s, [field]: e.target.checked }
                                    : s,
                                ),
                              )
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {matches.length === 0 && (
                <p className="live-empty">
                  沒有符合條件的歌曲，試試其他關鍵字。
                </p>
              )}
            </div>
          </>
        )}
        {tab === "inbox" && (
          <>
            <div className="live-workspace-heading">
              <div>
                <h2>每一個聲音，都有地方放。</h2>
                <p>
                  {managed
                    ? "來自 Google Sheet 的正式提交。處理狀態、匿名化與刪除需按「儲存修改」才會生效。"
                    : "在同一分頁送出 Demo 表單，即可在這裡查看。"}
                </p>
              </div>
              <div className="live-inline-actions">
                <button
                  className="live-button secondary"
                  disabled={!submissions.length}
                  onClick={exportCsv}
                >
                  <Download size={16} />
                  CSV 匯出
                </button>
                {managed && (
                  <button
                    className="live-button secondary"
                    onClick={async () => {
                      const response = await fetch(
                        "/api/live/admin/notifications",
                        { method: "POST" },
                      );
                      setNotice(
                        response.ok
                          ? "已開始處理待寄通知，實際結果請查看通知狀態。"
                          : "通知服務尚未啟用或暫時無法處理，請稍後再試。",
                      );
                    }}
                  >
                    處理待寄通知
                  </button>
                )}
                <button
                  className="live-button secondary"
                  disabled={!submissions.length}
                  onClick={() => {
                    if (
                      window.confirm(
                        "確認將目前這些互動匿名化？將清除暱稱、Email、IG 與留言內容。",
                      )
                    ) {
                      setSubmissions((old) =>
                        old.map((s) => ({
                          ...s,
                          nickname: "已匿名",
                          email: "",
                          instagram: "",
                          message: "",
                          notification: "無聯絡方式",
                        })),
                      );
                      setNotice(
                        managed
                          ? "已準備匿名化，請儲存修改。"
                          : "本次 Demo 互動已匿名化。",
                      );
                    }
                  }}
                >
                  批次匿名化
                </button>
              </div>
            </div>
            {!submissions.length ? (
              <div className="live-inbox-empty">
                <Inbox size={42} strokeWidth={1.2} />
                <h3>街角，等待第一個聲音。</h3>
                <p>
                  先到觀眾頁留一首歌，或寫一句話。
                  <br />
                  回到這裡，就能體驗完整收件流程。
                </p>
                <Link className="live-button" href="/live#interact">
                  體驗觀眾表單 <ArrowUpRight size={17} />
                </Link>
              </div>
            ) : (
              <div className="live-inbox-list">
                {submissions.map((s) => (
                  <article className="live-panel" key={s.id}>
                    <div className="live-panel-heading">
                      <span className="live-pill">
                        {s.topic ?? (s.kind === "鼓勵" ? "跟我說話" : s.kind)}
                      </span>
                      <small>
                        {new Date(s.createdAt).toLocaleString("zh-TW", {
                          timeZone: "Asia/Taipei",
                        })}
                      </small>
                    </div>
                    <h3>
                      {s.kind === "點歌"
                        ? `${s.title} — ${s.artist}`
                        : s.message || s.kind}
                    </h3>
                    {s.kind === "點歌" && <p>{s.message}</p>}
                    <p className="live-muted">
                      {s.nickname || "未留暱稱"} ·{" "}
                      {s.email || s.instagram || "未留聯絡方式"}
                    </p>
                    <p className="live-form-note">
                      回覆已同意{s.subscriptionConsent ? " · 訂閱另行同意" : ""}{" "}
                      · {s.notification}
                      {s.kind === "點歌"
                        ? ` · 同曲 ${submissions.filter((other) => other.kind === "點歌" && songKey(other.title, other.artist) === songKey(s.title, s.artist)).length} 次`
                        : ""}
                    </p>
                    <div className="live-inline-actions">
                      <label>
                        處理狀態
                        <select
                          value={s.status}
                          onChange={(e) =>
                            setSubmissions((old) =>
                              old.map((item) =>
                                item.id === s.id
                                  ? {
                                      ...item,
                                      status: e.target.value as typeof s.status,
                                    }
                                  : item,
                              ),
                            )
                          }
                        >
                          <option>待處理</option>
                          <option>處理中</option>
                          <option>已完成</option>
                        </select>
                      </label>
                      <button
                        className="live-icon-button"
                        aria-label="刪除此則互動"
                        onClick={() => {
                          if (
                            window.confirm(
                              "確認刪除此則互動？儲存後會從 Google Sheet 移除。",
                            )
                          )
                            setSubmissions((old) =>
                              old.filter((item) => item.id !== s.id),
                            );
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
