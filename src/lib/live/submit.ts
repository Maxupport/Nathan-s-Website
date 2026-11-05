// Browser-safe transport. Signing keys and Google URLs remain on the server.
export class SubmissionError extends Error {
  retryable: boolean;
  constructor(message: string, retryable = true) {
    super(message);
    this.retryable = retryable;
  }
}
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
  if (!response.ok) {
    const definitive = response.status >= 400 && response.status < 500;
    const message =
      definitive &&
      result &&
      typeof result === "object" &&
      "error" in result &&
      typeof result.error === "string"
        ? result.error.slice(0, 300)
        : "尚未確認保存成功，請保留此畫面並重試。";
    throw new SubmissionError(message, !definitive);
  }
  if (!result || typeof result !== "object")
    throw new SubmissionError("尚未確認保存成功，請保留此畫面並重試。");
  const receipt = result as Record<string, unknown>;
  if (
    receipt.id !== payload.id ||
    typeof receipt.savedAt !== "string" ||
    !Number.isFinite(Date.parse(receipt.savedAt))
  )
    throw new SubmissionError("尚未收到有效的保存回執，請保留此畫面並重試。");
  return { id: payload.id, savedAt: receipt.savedAt };
}
