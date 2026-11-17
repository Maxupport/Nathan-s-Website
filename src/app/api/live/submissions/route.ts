import { parseIntake, writeIntake } from "@/lib/live/intake";
import { after } from "next/server";
import { drainNotifications } from "@/lib/live/mail";
import { liveAvailable } from "@/lib/live/config";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  // Inert until an isolated preview has its write bridge explicitly configured.
  if (process.env.LIVE_SHEETS_INTAKE_ENABLED !== "true" || !liveAvailable())
    return Response.json(
      { error: "互動資料串接尚未啟用。" },
      { status: 503, headers },
    );
  const url = process.env.LIVE_SHEETS_BRIDGE_URL;
  const secret = process.env.LIVE_SHEETS_BRIDGE_SECRET;
  if (!url || !secret)
    return Response.json(
      { error: "互動資料串接尚未設定完成。" },
      { status: 503, headers },
    );
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json(
      { error: "不接受此來源的提交。" },
      { status: 403, headers },
    );
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    return Response.json(
      { error: "請使用表單送出。" },
      { status: 415, headers },
    );
  let intake;
  try {
    // Bound the streamed body as well as Content-Length (which clients may omit).
    const reader = request.body?.getReader();
    if (!reader) throw new Error("缺少表單內容。");
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 16_384) {
        await reader.cancel();
        return Response.json(
          { error: "表單內容過長。" },
          { status: 413, headers },
        );
      }
      chunks.push(value);
    }
    intake = parseIntake(JSON.parse(Buffer.concat(chunks).toString("utf8")));
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof SyntaxError
            ? "表單格式不正確。"
            : error instanceof Error
              ? error.message
              : "請檢查表單內容。",
      },
      { status: 400, headers },
    );
  }
  try {
    const receipt = await writeIntake(intake, { url, secret });
    after(() => drainNotifications(1));
    return Response.json(receipt, { status: 201, headers });
  } catch {
    // Do not expose Google responses, payloads or secrets in client errors or logs.
    return Response.json(
      { error: "尚未確認保存成功，請保留內容後重試。" },
      { status: 503, headers },
    );
  }
}
