"use client";
import { useCallback, useEffect, useState } from "react";
import { safeLyricsUrl } from "@/lib/live/lyrics";
import { emptyServices, parseServices, type ServiceLink } from "@/lib/live/services";
export default function ServiceLinkAdmin({managed}: {managed: boolean}) {
  const [services, setServices] = useState<ServiceLink[]>(emptyServices);
  const [baseline, setBaseline] = useState("");
  const [revision, setRevision] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmReload, setConfirmReload] = useState(false);
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(!managed);
  const load = useCallback(async () => {
    setBusy(true); setMessage(""); setConfirmReload(false);
    try {
      if (!managed) return;
      const response = await fetch("/api/live/admin/services", {cache: "no-store", credentials: "same-origin"});
      if (!response.ok) throw new Error(response.status === 401 ? "登入已過期，請重新登入。" : "讀取失敗，請重試。");
      const data = await response.json(), values = parseServices(data.services);
      setServices(values); setBaseline(JSON.stringify(values)); setRevision(data.revision); setLoaded(true);
    } catch (error) { setMessage(error instanceof Error ? error.message : "讀取失敗。"); }
    finally { setBusy(false); }
  }, [managed]);
  useEffect(() => { void load(); }, [load]); // This panel owns its independent revision and save action.
  const dirty = JSON.stringify(services) !== baseline;
  useEffect(() => {
    if (!dirty || !loaded) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, loaded]);
  function edit(index: number, patch: Partial<ServiceLink>) {
    setServices(old => old.map((s, i) => i === index ? {...s, ...patch} : s));
  }
  async function save() {
    setMessage("");
    let values;
    try { values = parseServices(services); } catch (error) { setMessage(error instanceof Error ? error.message : "設定不正確。"); return; }
    if (!managed) { setBaseline(JSON.stringify(values)); setServices(values); setMessage("Demo：設定只保留在本頁，不會更新正式網站。"); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/live/admin/services", {method: "PUT", headers: {"Content-Type": "application/json"}, credentials: "same-origin", body: JSON.stringify({revision, services: values})});
      if (response.status === 401) throw new Error("登入已過期，請重新登入。");
      const data = await response.json();
      if (!response.ok || data.ok !== true) throw new Error(data.error || "尚未確認保存，請重試。");
      const saved = parseServices(data.services);
      setServices(saved); setBaseline(JSON.stringify(saved)); setRevision(data.revision); setMessage("已儲存並套用，觀眾頁約 30 秒內更新；不會寄送通知。");
    } catch (error) { setMessage(error instanceof Error ? error.message : "儲存失敗。"); }
    finally { setBusy(false); }
  }
  return <section className="live-service-admin" aria-label="互動主題與服務連結">
    <p>六個主題各一個服務按鈕。設定全站共用，顯示在表單上方；啟用時請填按鈕文字與 HTTPS 網址。</p>
    <div className="live-preference-actions">
      <button className="live-button" disabled={busy || !loaded || !dirty} onClick={() => void save()}>儲存並套用服務連結</button>
      <button className="live-button secondary" disabled={busy} onClick={() => { if (dirty && loaded) setConfirmReload(true); else void load(); }}>重新載入服務設定</button>
    </div>
    {confirmReload && <div className="live-notice"><p>重新載入會放棄尚未儲存的服務設定。</p><button className="live-button secondary" onClick={() => void load()}>放棄修改並重新載入</button><button className="live-button secondary" onClick={() => setConfirmReload(false)}>保留修改</button></div>}
    <p role="status">{busy ? "處理中，請稍候…" : message || (dirty && loaded ? "服務連結有尚未儲存的修改。" : "")}</p>
    <fieldset disabled={busy || !loaded} className="live-service-fields">
      {services.map((s, i) => <section key={s.topic} className="live-service-editor">
        <h2>{s.topic}</h2>
        <label className="live-check"><input type="checkbox" checked={s.enabled} onChange={e => edit(i, {enabled: e.target.checked})}/>顯示服務按鈕</label>
        <label>引導文字<input maxLength={300} value={s.intro} onChange={e => edit(i, {intro: e.target.value})}/></label>
        <label>按鈕文字<input maxLength={60} value={s.label} placeholder="例如：了解服務內容" onChange={e => edit(i, {label: e.target.value})}/></label>
        <label>服務網址<input type="url" maxLength={2000} value={s.url} placeholder="https://…" onChange={e => edit(i, {url: e.target.value})}/></label>
        {safeLyricsUrl(s.url) && <a className="live-text-link" href={safeLyricsUrl(s.url)} target="_blank" rel="noopener noreferrer">預覽連結 ↗</a>}
      </section>)}
    </fieldset>
  </section>;
}
