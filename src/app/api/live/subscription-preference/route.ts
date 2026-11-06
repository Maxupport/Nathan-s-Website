import { callBridge } from "@/lib/live/bridge";
export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store" };
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ok: false}, {status: 403, headers});
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error();
    let body = "";
    const decoder = new TextDecoder();
    let bytes = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > 1024) { await reader.cancel(); return Response.json({ok:false}, {status:413,headers}); }
      body += decoder.decode(part.value, {stream:true});
    }
    body += decoder.decode();
    const value = JSON.parse(body);
    if (!value || typeof value !== "object" || !/^[a-f0-9]{64}$/.test(value.id) || !/^[a-f0-9]{64}$/.test(value.token) || !/^[a-f0-9-]{36}$/.test(value.submissionId) || !["yes", "no"].includes(value.choice)) throw new Error();
    const result = await callBridge({ operation: "subscriptionPreference", id: value.id, token: value.token, submissionId: value.submissionId, choice: value.choice });
    return Response.json({ok: result.ok === true}, {status: result.ok === true ? 200 : 400,headers});
  } catch { return Response.json({ok:false}, {status:503,headers}); }
}
