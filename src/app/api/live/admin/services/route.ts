import { isOwner } from "@/lib/live/auth";
import { callBridge } from "@/lib/live/bridge";
import { parseServices } from "@/lib/live/services";
export const runtime = "nodejs";
const headers = {"Cache-Control": "no-store"};
export async function GET() {
  if (!(await isOwner())) return new Response(null, {status: 401, headers});
  try {
    const result = await callBridge({operation: "servicesRead"});
    if (result.ok !== true || typeof result.revision !== "string") throw new Error();
    return Response.json({services: parseServices(result.services), revision: result.revision}, {headers});
  } catch { return Response.json({error: "無法讀取服務設定，請稍後重試。"}, {status: 503, headers}); }
}
export async function PUT(request: Request) {
  if (!(await isOwner())) return new Response(null, {status: 401, headers});
  if (request.headers.get("origin") !== new URL(request.url).origin) return new Response(null, {status: 403, headers});
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, {status: 400, headers});
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const part = await reader.read(); if (part.done) break;
    size += part.value.byteLength;
    if (size > 24000) { await reader.cancel(); return new Response(null, {status: 413, headers}); }
    chunks.push(part.value);
  }
  let services, revision;
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (typeof value.revision !== "string" || !/^[a-f0-9]{64}$/.test(value.revision)) throw new Error();
    revision = value.revision; services = parseServices(value.services);
  } catch { return Response.json({error: "設定格式不正確，請確認按鈕文字及 HTTPS 網址。"}, {status: 400, headers}); }
  try {
    const result = await callBridge({operation: "servicesSave", revision, services});
    if (result.conflict) return Response.json({error: "設定已被修改，請先重新載入。"}, {status: 409, headers});
    if (result.ok !== true || typeof result.revision !== "string") throw new Error();
    return Response.json({ok: true, services: parseServices(result.services), revision: result.revision}, {headers});
  } catch { return Response.json({error: "尚未確認保存，請重新載入檢查或重試。"}, {status: 503, headers}); }
}
