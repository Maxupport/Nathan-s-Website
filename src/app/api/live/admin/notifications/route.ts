import { isOwner } from "@/lib/live/auth";
import { after } from "next/server";
import { drainNotifications } from "@/lib/live/mail";
export const runtime = "nodejs";
export const maxDuration = 120;
export async function POST(request: Request) {
  if (!(await isOwner())) return new Response(null, { status: 401 });
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return new Response(null, { status: 403 });
  if (!process.env.LIVE_EMAIL_BRIDGE_URL)
    return Response.json({ error: "寄信服務尚未啟用。" }, { status: 503 });
  after(() => drainNotifications());
  return Response.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
