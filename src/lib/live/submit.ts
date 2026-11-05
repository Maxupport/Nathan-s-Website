// Browser-safe transport. Signing keys and Google URLs remain on the server.
export async function submitInteraction(
  payload: { id: string; [key: string]: unknown },
  transport: typeof fetch = fetch,
) {
  const response = await transport("/api/live/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
    credentials: "same-origin",
    signal: AbortSignal.timeout(30_000),
  });
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok || !result || typeof result !== "object")
    throw new Error("尚未確認保存成功，請保留此畫面並重試。");
  const receipt = result as Record<string, unknown>;
  if (
    receipt.id !== payload.id ||
    typeof receipt.savedAt !== "string" ||
    !Number.isFinite(Date.parse(receipt.savedAt))
  )
    throw new Error("尚未收到有效的保存回執，請保留此畫面並重試。");
  return { id: payload.id, savedAt: receipt.savedAt };
}
