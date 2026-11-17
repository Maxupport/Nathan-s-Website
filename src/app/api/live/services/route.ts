import { callBridge } from "@/lib/live/bridge";
import { publicServices } from "@/lib/live/services";
export const runtime = "nodejs";
export async function GET() {
  try {
    const result = await callBridge({operation: "servicesRead"});
    if (result.ok !== true) throw new Error();
    return Response.json({services: publicServices(result.services)}, {headers: {"Cache-Control": "public, max-age=0, s-maxage=5"}});
  } catch {
    return Response.json({error: "服務介紹暫時無法更新。"}, {status: 503, headers: {"Cache-Control": "no-store"}});
  }
}
