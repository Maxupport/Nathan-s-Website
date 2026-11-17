import { cookies } from "next/headers";
import { createOwnerSession, verifyOwnerProof } from "@/lib/live/auth-core";
import { ownerAuthEnabled, sessionCookie, stateCookie } from "@/lib/live/auth";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store" };
export async function POST(request: Request) {
  if (!ownerAuthEnabled())
    return Response.json({ error: "登入尚未啟用。" }, { status: 503, headers });
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return new Response(null, { status: 403, headers });
  if (Number(request.headers.get("content-length")) > 4096)
    return new Response(null, { status: 413, headers });
  // Read at most 4 KB, including clients without Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400, headers });
  let body = "";
  let length = 0;
  const decoder = new TextDecoder();
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    length += part.value.byteLength;
    if (length > 4096) {
      await reader.cancel();
      return new Response(null, { status: 413, headers });
    }
    body += decoder.decode(part.value, { stream: true });
  }
  let token: unknown;
  try {
    token = JSON.parse(body + decoder.decode()).proof;
  } catch {
    return new Response(null, { status: 400, headers });
  }
  const jar = await cookies();
  const state = jar.get(stateCookie)?.value ?? "";
  jar.delete(stateCookie);
  const secret = process.env.LIVE_SHEETS_BRIDGE_SECRET ?? "";
  if (typeof token !== "string" || !verifyOwnerProof(token, state, secret))
    return Response.json(
      { error: "登入已過期或帳號不符，請重新登入。" },
      { status: 401, headers },
    );
  jar.set(sessionCookie, createOwnerSession(secret), {
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 43200,
  });
  return Response.json({ ok: true }, { headers });
}
export async function DELETE(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return new Response(null, { status: 403, headers });
  (await cookies()).delete(sessionCookie);
  return Response.json({ ok: true }, { headers });
}
