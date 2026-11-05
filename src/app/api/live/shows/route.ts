import { callBridge } from "@/lib/live/bridge";
import { parseShow } from "@/lib/live/admin-state";
export const runtime = "nodejs";
export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  if (
    process.env.LIVE_ADMIN_AUTH_ENABLED !== "true" ||
    process.env.VERCEL_ENV === "production"
  )
    return Response.json({ shows: [] }, { headers });
  try {
    const result = await callBridge({ operation: "publicRead" });
    if (result.ok !== true || !Array.isArray(result.shows)) throw new Error();
    // Reconstruct each allowed field, discarding unknown Sheet JSON properties.
    return Response.json(
      {
        shows: result.shows.map(parseShow).filter((s) => s.status !== "draft"),
      },
      { headers },
    );
  } catch {
    return Response.json(
      { error: "暫時無法更新演出資訊。" },
      { status: 503, headers },
    );
  }
}
