import { isOwner } from "@/lib/live/auth";
import { callBridge } from "@/lib/live/bridge";
import { decodeAdmin, parseChanges } from "@/lib/live/admin-state";
import { after } from "next/server";
import { drainNotifications } from "@/lib/live/mail";
export const runtime = "nodejs";
export const maxDuration = 120;
const headers = { "Cache-Control": "no-store" };
export async function GET() {
  if (!(await isOwner()))
    return Response.json(
      { error: "請先以 Max 的帳號登入。" },
      { status: 401, headers },
    );
  try {
    const result = await callBridge({ operation: "adminRead" });
    if (result.ok !== true) throw new Error();
    if (result.notificationsPending === true)
      after(() => drainNotifications(1));
    return Response.json(decodeAdmin(result), { headers });
  } catch {
    return Response.json(
      { error: "無法讀取 Google Sheet，請稍後重試。" },
      { status: 503, headers },
    );
  }
}
export async function PUT(request: Request) {
  if (!(await isOwner())) return new Response(null, { status: 401, headers });
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return new Response(null, { status: 403, headers });
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400, headers });
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    length += part.value.byteLength;
    if (length > 280000) {
      await reader.cancel();
      return new Response(null, { status: 413, headers });
    }
    chunks.push(part.value);
  }
  let value, changes;
  try {
    value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (
      typeof value.revision !== "string" ||
      !/^[a-f0-9]{64}$/.test(value.revision)
    )
      throw new Error();
    changes = parseChanges(value.changes);
  } catch {
    return Response.json(
      { error: "修改資料格式不正確。" },
      { status: 400, headers },
    );
  }
  try {
    const result = await callBridge({
      operation: "adminSave",
      revision: value.revision,
      changes,
    });
    if (result.conflict)
      return Response.json(
        { error: "Google Sheet 已有其他修改，請先重新載入再編輯。" },
        { status: 409, headers },
      );
    if (result.ok !== true || typeof result.revision !== "string")
      throw new Error();
    after(() => drainNotifications());
    return Response.json({ ok: true, revision: result.revision, shows: result.shows }, { headers });
  } catch {
    return Response.json(
      { error: "尚未確認完整保存，請重新載入檢查後再試。" },
      { status: 503, headers },
    );
  }
}
