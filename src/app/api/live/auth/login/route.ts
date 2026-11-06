import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { ownerAuthEnabled, stateCookie } from "@/lib/live/auth";

export const runtime = "nodejs";
export async function GET(request: Request) {
  if (!ownerAuthEnabled() || !process.env.LIVE_SHEETS_BRIDGE_URL)
    return Response.json({ error: "管理端登入尚未啟用。" }, { status: 503 });
  const state = randomBytes(32).toString("hex");
  const origin = new URL(request.url).origin;
  (await cookies()).set(stateCookie, state, {
    httpOnly: true,
    secure: origin.startsWith("https:"),
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });
  const url = new URL(process.env.LIVE_SHEETS_BRIDGE_URL);
  if (
    url.origin !== "https://script.google.com" ||
    !/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname)
  )
    return new Response(null, { status: 503 });
  url.searchParams.set("state", state);
  url.searchParams.set("returnTo", `${origin}/live/auth`);
  // The public intake bridge also accepts anonymous requests. Explicitly select
  // a Google account before entering it so a fresh phone can actually sign in.
  const chooser = new URL("https://accounts.google.com/AccountChooser");
  chooser.searchParams.set("continue", url.toString());
  chooser.searchParams.set("Email", "maxupport@gmail.com");
  return new Response(null, {
    status: 303,
    headers: { Location: chooser.toString(), "Cache-Control": "no-store" },
  });
}
