"use client";
import { useEffect, useRef, useState } from "react";

export default function OwnerLoginCallback() {
  const started = useRef(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const proof = new URLSearchParams(location.hash.slice(1)).get("proof");
    history.replaceState(null, "", location.pathname);
    if (!proof) {
      location.replace("/live/admin");
      return;
    }
    fetch("/api/live/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proof }),
      credentials: "same-origin",
    })
      .then((response) => {
        if (!response.ok) throw new Error();
        location.replace("/live/admin");
      })
      .catch(() =>
        setError("登入未完成，請確認使用 Max 的 Google 帳號並重新登入。"),
      );
  }, []);
  return (
    <main className="live-container live-section">
      <h1>{error ? "登入未完成" : "正在確認登入…"}</h1>
      {error && (
        <>
          <p role="alert">{error}</p>
          <a className="live-button" href="/api/live/auth/login">
            重新以 Google 登入
          </a>
        </>
      )}
    </main>
  );
}
