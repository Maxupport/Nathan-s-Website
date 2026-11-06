import { callBridge } from "@/lib/live/bridge";
import { liveAvailable } from "@/lib/live/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function page(message: string, status = 200, confirm = false) {
  return new Response(`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Maxupport LIVE｜演出預告訂閱</title></head><body style="max-width:520px;margin:60px auto;padding:24px;font:18px/1.8 system-ui;background:#f6f4e9;color:#153c47"><h1>街頭演出預告訂閱</h1><p>${message}</p>${confirm ? '<form method="post"><button style="padding:16px;font:inherit">確認取消演出預告訂閱</button></form>' : ''}<p><a href="/live">返回 Maxupport LIVE</a></p></body></html>`, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'" },
  });
}
function credentials(request: Request) {
  const params = new URL(request.url).searchParams;
  const id = params.get("id") ?? "", token = params.get("token") ?? "";
  return /^[a-f0-9]{64}$/.test(id) && /^[a-f0-9]{64}$/.test(token) ? { id, token } : null;
}
export async function GET(request: Request) {
  if (!liveAvailable() || !credentials(request)) return page("取消訂閱連結無效，請使用演出預告信內的連結。", 400);
  // Email scanners may visit links automatically. Only an explicit POST opts out.
  return page("確認後，你將不再收到之後的街頭演出預告。這不會刪除已送出的點歌或提問，也不影響文章與小說訂閱。", 200, true);
}
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return page("請從取消訂閱頁面操作。", 403);
  const value = credentials(request);
  if (!liveAvailable() || !value) return page("取消訂閱連結無效。", 400);
  try {
    const result = await callBridge({ operation: "unsubscribe", ...value });
    if (result.ok !== true) return page("取消訂閱連結無效，請使用演出預告信內的連結。", 400);
    return page("已取消街頭演出預告訂閱。之後若再次點歌或提問並重新同意訂閱，才會重新加入。");
  } catch {
    return page("目前尚未確認取消成功，請保留此頁並稍後重試。", 503);
  }
}
