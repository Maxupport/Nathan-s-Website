"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Check, X, ArrowRight } from "lucide-react";
import { useLive } from "./LiveProvider";
import type { ConversationTopic, Kind, Submission } from "@/lib/live/model";
import { submitInteraction, SubmissionError } from "@/lib/live/submit";

export default function InteractionForm({
  kind,
  topic,
  completed,
  onClose,
  onComplete,
}: {
  kind: Kind;
  topic?: ConversationTopic;
  completed: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const { intakeEnabled, setSubmissions } = useLive();
  const [pending, setPending] = useState(false);
  const retry = useRef<Parameters<typeof submitInteraction>[0] | null>(null);
  const sending = useRef(false);
  const [openedAt] = useState(() => new Date().toISOString());
  const events = useRef<Array<{ name: string; at: string }>>([]);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
    };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const data = new FormData(event.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    if (get("website")) return;
    if (!consent && !retry.current) {
      setError("請先同意就本次內容接受回覆。");
      return;
    }
    if (
      !retry.current &&
      ["提問", "聯絡"].includes(kind) &&
      !get("email") &&
      !get("instagram")
    ) {
      setError("請至少留下 Email 或 Instagram，讓 Max 可以回覆你。");
      return;
    }
    if (!retry.current && kind === "訂閱" && !data.get("subscription")) {
      setError("請確認是否同意收到你選擇的內容更新。");
      return;
    }
    const submission: Submission = {
      id: crypto.randomUUID(),
      kind,
      topic,
      nickname: get("nickname"),
      email: get("email"),
      instagram: get("instagram"),
      title: get("title"),
      artist: get("artist"),
      message: get("message"),
      replyConsent: true,
      subscriptionConsent: Boolean(data.get("subscription")),
      createdAt: new Date().toISOString(),
      status: "待處理",
      notification: "尚未排入",
    };
    if (!intakeEnabled) {
      setSubmissions((old) => [submission, ...old]);
      onComplete();
      return;
    }
    // Freeze the exact attempt on uncertainty: retrying cannot create another row.
    retry.current ??= {
      ...submission,
      consentVersion: "live-reply-v1",
      events: [
        ...events.current,
        { name: "submitted", at: new Date().toISOString() },
      ],
    };
    sending.current = true;
    setPending(true);
    setError("");
    try {
      await submitInteraction(retry.current);
      onComplete();
    } catch (error) {
      if (error instanceof SubmissionError && !error.retryable) {
        retry.current = null;
        setError(error.message);
      } else
        setError(
          "尚未確認保存成功。內容已保留在此表單；請按「重試保存」，重試會使用相同提交編號。請勿關閉或重新整理。",
        );
    } finally {
      sending.current = false;
      setPending(false);
    }
  }
  return (
    <dialog
      ref={ref}
      className="live-modal"
      aria-labelledby={titleId}
      onCancel={(event) => {
        if (pending) event.preventDefault();
        else onClose();
      }}
      onClick={(e) => {
        if (!pending && e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="live-modal-body">
        <button
          type="button"
          className="live-icon-button live-modal-close"
          aria-label="關閉表單"
          onClick={onClose}
          disabled={pending}
        >
          <X size={22} />
        </button>
        {completed ? (
          <div className="live-success">
            <span>
              <Check size={32} />
            </span>
            <p className="live-eyebrow">
              THANK YOU FOR LEAVING A LITTLE SOMETHING
            </p>
            <h2 id={titleId}>這份心意，留下了。</h2>
            <p>
              {intakeEnabled
                ? "已確認保存，Max 會閱讀你留下的內容。"
                : "已加入本次 Demo 收件匣；尚未正式提交。"}
              {intakeEnabled && kind === "訂閱" && (
                <>
                  <br />
                  已記錄訂閱意願，尚未完成既有訂閱流程。
                </>
              )}
            </p>
            {intakeEnabled && kind === "訂閱" && (
              <a
                className="live-button secondary"
                href="https://docs.google.com/forms/d/e/1FAIpQLScjPUif6r1y_82PTK5rKjYFK7Qjt6dWf_p3U2UG19O7gS8pVw/viewform"
                target="_blank"
                rel="noopener noreferrer"
              >
                繼續至既有表單完成訂閱 <ArrowRight size={17} />
              </a>
            )}
            <button className="live-button" onClick={onClose}>
              回到街角 <ArrowRight size={17} />
            </button>
          </div>
        ) : (
          <>
            <p className="live-eyebrow">
              A LITTLE CONNECTION /{" "}
              {topic ?? (kind === "鼓勵" ? "跟我說話" : kind)}
            </p>
            <h2 id={titleId}>
              {topic
                ? `聊聊${topic}`
                : kind === "點歌"
                  ? "這次，想聽哪一首？"
                  : kind === "提問"
                    ? "慢慢說，我在聽。"
                    : kind === "訂閱"
                      ? "讓故事，繼續陪你。"
                      : kind === "聯絡"
                        ? "從一句你好開始。"
                        : "有什麼話，都可以說。"}
            </h2>
            <p className="live-muted">
              {intakeEnabled
                ? "送出後會安全保存，請等待成功提示。"
                : "Demo 體驗，請填測試資料；重新整理後即清除。"}
            </p>
            {step === 1 ? (
              <div className="live-consent-step">
                <p>
                  Max
                  會閱讀你留下的內容，並依你提供的聯絡方式，就這次互動回覆你。
                </p>
                <label className="live-check">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>我同意 Max 就本次互動主動給我回覆。</span>
                </label>
                <button
                  className="live-button"
                  disabled={!consent}
                  onClick={() => {
                    if (!events.current.length)
                      events.current = [
                        { name: "form_opened", at: openedAt },
                        {
                          name: "reply_consent_accepted",
                          at: new Date().toISOString(),
                        },
                        {
                          name: "details_opened",
                          at: new Date().toISOString(),
                        },
                      ];
                    setStep(2);
                  }}
                >
                  繼續填寫 <ArrowRight size={17} />
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="live-form">
                <fieldset
                  disabled={pending || Boolean(retry.current)}
                  className="live-form-fields"
                >
                  <input
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    className="live-honeypot"
                    aria-hidden="true"
                  />
                  {kind === "點歌" && (
                    <>
                      <label>
                        歌曲名稱 <em>必填</em>
                        <input
                          name="title"
                          required
                          maxLength={160}
                          placeholder="例如：末班車"
                        />
                      </label>
                      <label>
                        原唱／演唱者 <em>必填</em>
                        <input
                          name="artist"
                          required
                          maxLength={100}
                          placeholder="例如：蕭煌奇"
                        />
                      </label>
                      <p className="live-form-note">
                        你點的歌，我會唱。不保證這場或下一場；可能需要練習，沒有期限，但會盡快。
                      </p>
                    </>
                  )}
                  <label>
                    怎麼稱呼你？ <span>選填</span>
                    <input
                      name="nickname"
                      maxLength={60}
                      autoComplete="nickname"
                      placeholder="本名、暱稱都可以"
                    />
                  </label>
                  <div className="live-form-row">
                    <label>
                      Email {kind === "訂閱" && <em>必填</em>}
                      <input
                        type="email"
                        name="email"
                        required={kind === "訂閱"}
                        maxLength={254}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </label>
                    <label>
                      Instagram
                      <input
                        name="instagram"
                        maxLength={100}
                        placeholder="@your_name"
                        autoComplete="off"
                      />
                    </label>
                  </div>
                  {kind === "點歌" && (
                    <p className="live-form-note">
                      若想在歌曲排入演出時收到通知，請留下 Email 或 IG。
                    </p>
                  )}
                  {kind === "訂閱" ? (
                    <>
                      <label>
                        想收到的內容
                        <select name="message" defaultValue="文章與小說">
                          <option>文章與小說</option>
                          <option>文章更新</option>
                          <option>小說更新</option>
                        </select>
                      </label>
                      <label className="live-check">
                        <input name="subscription" type="checkbox" required />
                        <span>
                          我自願訂閱上述內容更新。
                          <small>
                            {intakeEnabled
                              ? "此處先記錄訂閱意願，完成既有訂閱流程後才會建立訂閱。"
                              : "正式版將串接既有訂閱流程；本次 Demo 不會建立訂閱。"}
                          </small>
                        </span>
                      </label>
                    </>
                  ) : (
                    <label>
                      {kind === "提問"
                        ? "你想問的問題"
                        : kind === "聯絡"
                          ? "想和 Max 聊什麼？"
                          : kind === "鼓勵"
                            ? "想跟 Max 說的話"
                            : "還想說點什麼？"}
                      {kind !== "點歌" && <em>必填</em>}
                      <textarea
                        name="message"
                        required={kind !== "點歌"}
                        maxLength={2000}
                        rows={4}
                        placeholder="慢慢寫，不用急。"
                      />
                    </label>
                  )}
                  <p className="live-form-note">
                    {intakeEnabled
                      ? "內容預設永久保留，由 Max 管理；你可聯絡 maxupport@gmail.com 協助刪除。只記錄送出內容及表單操作事件，不記錄逐字輸入。"
                      : "Demo 僅保留在目前分頁記憶體，重新整理即清除。"}
                  </p>
                </fieldset>
                {error && (
                  <p className="live-error" role="alert">
                    {error}
                  </p>
                )}
                <div className="live-form-actions">
                  <button
                    type="button"
                    className="live-text-link"
                    onClick={() => setStep(1)}
                    disabled={pending || Boolean(retry.current)}
                  >
                    返回
                  </button>
                  <button
                    type="submit"
                    className="live-button"
                    disabled={pending}
                  >
                    {pending
                      ? "正在保存…"
                      : retry.current
                        ? "重試保存"
                        : intakeEnabled
                          ? `送出${topic ?? (kind === "鼓勵" ? "留言" : kind)}`
                          : `送出 Demo ${topic ?? (kind === "鼓勵" ? "留言" : kind)}`}{" "}
                    <ArrowRight size={17} />
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </dialog>
  );
}
