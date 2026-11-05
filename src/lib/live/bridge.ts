import { signBridgePayload } from "./intake";

export async function callBridge(request: Record<string, unknown>) {
  const endpoint = process.env.LIVE_SHEETS_BRIDGE_URL,
    secret = process.env.LIVE_SHEETS_BRIDGE_SECRET;
  if (
    !endpoint ||
    !secret ||
    secret.length < 32 ||
    process.env.VERCEL_ENV === "production"
  )
    throw new Error("未設定資料串接。");
  const url = new URL(endpoint);
  if (
    url.origin !== "https://script.google.com" ||
    !/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname) ||
    url.search
  )
    throw new Error("資料串接設定不正確。");
  const timestamp = Date.now(),
    payload = JSON.stringify(request);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      timestamp,
      payload,
      signature: signBridgePayload(payload, timestamp, secret),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(25000),
  });
  const result = await response.json();
  if (!response.ok || !result || typeof result !== "object")
    throw new Error("資料服務未回覆。");
  return result as Record<string, unknown>;
}
