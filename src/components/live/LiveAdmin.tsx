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
import { useState, type FormEvent } from "react";
import {
  categories,
  generate,
  previousIds,
  warnings,
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
  const { songs, setSongs, shows, setShows, submissions, setSubmissions } =
    useLive();
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
            i.song.title.trim() === s.title.trim() &&
            i.song.artist.trim() === s.artist.trim(),
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
      "Demo 預告已發布，可以切到觀眾頁查看。通知僅建立示例狀態，未實際寄送。",
    );
  }
  function newShow() {
    const sequence = Math.max(...shows.map((s) => s.sequence), 0) + 1;
    const item: Show = {
      id: crypto.randomUUID(),
      sequence,
      date: "",
      location: "",
      copy: "",
      mode: "oldies",
      artist: "",
      items: generate(songs, "oldies", "", excluded),
      status: "draft",
      overrideWarnings: [],
    };
    setShows((old) => [...old, item]);
    setSelected(item.id);
    setNotice("已產生一份新的下一場草稿。");
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
    setNotice("已加入示例歌庫，預設可上場。");
  }
  function exportCsv() {
    const rows = [
      [
        "類型",
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
      `"${(/^[=+@\-\t\r]/.test(value) ? "'" + value : value).replaceAll('"', '""')}"`;
    const url = URL.createObjectURL(
      new Blob(
        ["\uFEFF", rows.map((row) => row.map(safe).join(",")).join("\r\n")],
        { type: "text/csv;charset=utf-8" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "maxupport-live-demo.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
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
          <span className="live-pill">DEMO WORKSPACE</span>
          <p>
            獨立示例歌庫，未同步 Google Sheet。
            <br />
            尚未啟用登入、永久保存或寄信。
            <br />
            重新整理會重設所有操作。
          </p>
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
            觀眾頁 Preview <ArrowUpRight size={16} />
          </Link>
        </header>
        <div role="status" aria-live="polite">
          {notice && (
            <div className="live-notice">
              <Check size={18} />
              {notice}
            </div>
          )}
        </div>
        <div className="live-stats">
          <div>
            <small>示例歌曲</small>
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
                <p>首批已準備兩份草稿；後續每次新增一份。</p>
              </div>
              <button className="live-button secondary" onClick={newShow}>
                <Plus size={16} />
                新一場草稿
              </button>
            </div>
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
                        <option value="oldies">老歌主題</option>
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
                          <option value="">選擇示例歌曲</option>
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
                    <>
                      <button
                        className="live-button live-full"
                        onClick={() => {
                          if (!confirmComplete) {
                            setConfirmComplete(true);
                            return;
                          }
                          updateShow({ status: "performed" });
                          setConfirmComplete(false);
                          setNotice(
                            "這場已移到上一場歌單。請選擇下一份草稿發布新預告。",
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
                <p>以下為獨立示例分類。你正在編輯的 Google Sheet 不受影響。</p>
              </div>
              <button
                className="live-button"
                onClick={() => setAdding(!adding)}
              >
                <Plus size={17} />
                新增示例歌曲
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
                    <th>主分類</th>
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
                          {categories.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </td>
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
                <p>在同一分頁送出 Demo 表單，即可在這裡查看。</p>
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
                <button
                  className="live-button secondary"
                  disabled={!submissions.length}
                  onClick={() => {
                    if (
                      window.confirm(
                        "確認將所有 Demo 互動匿名化？將清除暱稱、Email、IG 與留言內容。",
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
                      setNotice("本次 Demo 互動已匿名化。");
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
                      <span className="live-pill">{s.kind}</span>
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
                        ? ` · 同曲 ${submissions.filter((other) => other.kind === "點歌" && other.title.trim() === s.title.trim() && other.artist.trim() === s.artist.trim()).length} 次`
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
                          if (window.confirm("確認刪除此則 Demo 互動？"))
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
