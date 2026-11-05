"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Heart,
  MapPin,
  MessageCircle,
  Mic2,
  Music2,
  Send,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useLive } from "./LiveProvider";
import InteractionForm from "./InteractionForm";
import type { Kind, Show } from "@/lib/live/model";

export const interactions = [
  {
    kind: "點歌" as Kind,
    title: "這首，想聽你唱",
    copy: "把歌名和演唱者留給我。",
    icon: Music2,
    color: "green",
  },
  {
    kind: "提問" as Kind,
    title: "有件事，想問問",
    copy: "關於生活，或卡住的選擇。",
    icon: MessageCircle,
    color: "blue",
  },
  {
    kind: "訂閱" as Kind,
    title: "故事，繼續讀下去",
    copy: "收到我的文章與小說更新。",
    icon: Send,
    color: "peach",
  },
  {
    kind: "聯絡" as Kind,
    title: "找個時間聊聊",
    copy: "聊聊你的想法，或合作邀約。",
    icon: Mic2,
    color: "sand",
  },
  {
    kind: "鼓勵" as Kind,
    title: "留一句，給 Max",
    copy: "你的話，我會好好收著。",
    icon: Heart,
    color: "rose",
  },
];

function Setlist({ show }: { show: Show }) {
  return (
    <ol className="live-setlist">
      {show.items.map((item, index) => (
        <li key={`${item.song.id}-${index}`}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>{item.song.title}</strong>
            <small>{item.song.artist}</small>
          </div>
          {item.song.showcase && <Sparkles size={15} aria-label="炫技歌曲" />}
        </li>
      ))}
    </ol>
  );
}

export default function LivePublic() {
  const { shows } = useLive();
  const [kind, setKind] = useState<Kind | null>(null);
  const [completed, setCompleted] = useState(false);
  const next = shows.find((s) => s.status === "next");
  const previous = shows
    .filter((s) => s.status === "performed")
    .sort((a, b) => b.sequence - a.sequence)[0];
  return (
    <>
      <div className="live-demo-bar">
        PREVIEW · 體驗版，請使用測試資料；重新整理會重設。
        <Link href="/live/admin">
          管理端 Demo <ArrowUpRight size={13} />
        </Link>
      </div>
      <header className="live-header live-container">
        <Link href="/live" className="live-logo">
          Maxupport
          <span>
            LIVE
            <span className="live-dot" />
          </span>
        </Link>
        <nav aria-label="頁面導覽">
          <a href="#shows">演出歌單</a>
          <a href="#interact">
            留首歌・留句話 <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>
      <main>
        <section className="live-hero live-container">
          <div className="live-hero-copy">
            <p className="live-eyebrow">
              <span className="live-dot" /> SOMEWHERE, A SONG CONNECTS US
            </p>
            <h1>
              在人生的街角，
              <br />
              唱一首<span className="live-handline">你的歌。</span>
            </h1>
            <p className="live-intro">
              嗨，我是 Max。
              <br />
              街頭唱歌，也陪你整理想法。
            </p>
            <p className="live-muted">
              有些話，說不出來。
              <br />
              或許剛好，有一首歌可以替你說。
            </p>
            <a className="live-button" href="#interact">
              留首歌，或留句話 <ArrowUpRight size={19} />
            </a>
            <a className="live-quiet-link" href="#shows">
              看看下一場 <ArrowDown size={15} />
            </a>
          </div>
          <div className="live-stage" aria-label="街角演出插畫">
            <div className="live-stage-label">THE STREET IS OUR STAGE.</div>
            <div className="live-lights" aria-hidden="true">
              {Array.from({ length: 7 }, (_, i) => (
                <i key={i} />
              ))}
            </div>
            <Music2 className="live-note note-one" size={40} />
            <Music2 className="live-note note-two" size={23} />
            <div className="live-stage-circle" />
            <div className="live-mic" aria-hidden="true">
              <Mic2 size={112} strokeWidth={1.4} />
              <i />
            </div>
            <div className="live-board">
              <small>TODAY&apos;S SPECIAL</small>
              <strong>
                街頭唱歌
                <br />
                也聊人生
              </strong>
              <span>一首歌，一段相遇。</span>
              <Heart size={23} />
            </div>
            <div className="live-stage-ground" />
            <div className="live-stage-caption">
              <span>♪</span> 不只聽歌，也聽見彼此。
            </div>
            <div className="live-small-stamp">
              Max
              <br />
              <span>with you.</span>
            </div>
          </div>
        </section>
        <div className="live-ticker" aria-hidden="true">
          <span>把日子唱成歌</span>
          <span>✳</span>
          <span>把心事留給我</span>
          <span>✳</span>
          <span>A LITTLE MUSIC, A LITTLE CONNECTION</span>
          <span>✳</span>
        </div>
        <section id="interact" className="live-section live-container">
          <div className="live-section-heading">
            <div>
              <p className="live-eyebrow">01 / A LITTLE CONNECTION</p>
              <h2>今天，想留下什麼？</h2>
            </div>
            <p>
              一首歌、一個問題，或只是打聲招呼。
              <br />
              我都會好好看。
            </p>
          </div>
          <div className="live-interactions">
            {interactions.map(
              ({ kind: k, title, copy, icon: Icon, color }, index) => (
                <button
                  type="button"
                  key={k}
                  className={`live-interaction ${color}`}
                  onClick={() => {
                    setCompleted(false);
                    setKind(k);
                  }}
                >
                  <span className="live-card-top">
                    <Icon size={26} strokeWidth={1.6} />
                    <span>0{index + 1}</span>
                  </span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  <span className="live-card-bottom">
                    {k}
                    <ArrowUpRight size={21} />
                  </span>
                </button>
              ),
            )}
          </div>
          <div className="live-promise">
            <Check size={19} />
            <p>
              你點的歌，我會唱。
              <span>
                不一定是這一場，有些歌需要一點練習時間；沒有期限，但我會盡快安排。
              </span>
            </p>
          </div>
        </section>
        <section id="shows" className="live-shows">
          <div className="live-container live-section">
            <div className="live-section-heading">
              <div>
                <p className="live-eyebrow">02 / SEE YOU AT THE NEXT CORNER</p>
                <h2>下一次，在歌裡見。</h2>
              </div>
              <span className="live-pill">由 Max 手動更新</span>
            </div>
            <div className="live-show-grid">
              <article className="live-next-card">
                <span className="live-eyebrow">UP NEXT / 下一場</span>
                <h3>
                  {next ? `第 ${next.sequence} 場・街角見` : "下一場，準備中。"}
                </h3>
                {next ? (
                  <>
                    <div className="live-show-meta">
                      <span>
                        <CalendarDays size={17} />
                        {new Date(`${next.date}+08:00`).toLocaleString(
                          "zh-TW",
                          {
                            timeZone: "Asia/Taipei",
                            month: "long",
                            day: "numeric",
                            weekday: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          },
                        )}
                      </span>
                      <span>
                        <MapPin size={17} />
                        {next.location}
                      </span>
                    </div>
                    <p>{next.copy}</p>
                    <Setlist show={next} />
                  </>
                ) : (
                  <>
                    <p>
                      正在挑歌，也正在尋找下一個相遇的街角。
                      <br />
                      日期、地點與完整歌單確認後，會在這裡公開。
                    </p>
                    <div className="live-empty-visual">
                      <Music2 size={55} strokeWidth={1} />
                      <span>GOOD THINGS TAKE A LITTLE PRACTICE.</span>
                    </div>
                    <a href="#interact" className="live-text-link">
                      先把想聽的歌留給我 <ChevronRight size={16} />
                    </a>
                  </>
                )}
              </article>
              <article className="live-previous-card">
                <span className="live-eyebrow">LAST TIME / 上一場的回音</span>
                <h3>
                  {previous
                    ? `第 ${previous.sequence} 場・謝謝你來`
                    : "故事，正要開始。"}
                </h3>
                {previous ? (
                  <>
                    <p>{previous.location}</p>
                    <Setlist show={previous} />
                  </>
                ) : (
                  <>
                    <p>
                      第一場結束後，這裡會收好當天唱過的每一首歌。
                      <br />
                      謝謝你，願意成為故事的一部分。
                    </p>
                    <div className="live-quote">
                      「有些相遇很短，
                      <br />
                      但一首歌可以留很久。」
                    </div>
                    <span className="live-signature">— Max</span>
                  </>
                )}
              </article>
            </div>
          </div>
        </section>
        <section className="live-about live-container live-section">
          <div>
            <p className="live-eyebrow">MORE THAN A SONG</p>
            <h2>
              我不只會唱歌，
              <br />
              也想陪你想一想。
            </h2>
          </div>
          <div>
            <p>
              職涯困境、人生停滯、創業想法、保單健診，
              <br />
              或一個還沒有形狀的合作邀約。
            </p>
            <p>不急著給答案。先從一首歌、一段對話開始。</p>
            <a
              href="https://www.instagram.com/maxupport/"
              target="_blank"
              rel="noreferrer"
              className="live-text-link"
            >
              到 Instagram 找 Max <ArrowUpRight size={17} />
            </a>
          </div>
        </section>
      </main>
      <footer className="live-footer live-container">
        <Link href="/live" className="live-logo">
          Maxupport<span>生涯擺渡人 Max</span>
        </Link>
        <p>The Best Setter for everything.</p>
        <span>© {new Date().getFullYear()} Maxupport</span>
      </footer>
      {kind && (
        <InteractionForm
          kind={kind}
          completed={completed}
          onClose={() => setKind(null)}
          onComplete={() => setCompleted(true)}
        />
      )}
    </>
  );
}
