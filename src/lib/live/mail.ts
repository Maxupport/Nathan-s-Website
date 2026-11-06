import { createHmac } from "node:crypto";
import { callBridge } from "./bridge.ts";
import { liveAvailable } from "./config.ts";

// Mail uses a separate Google project and a derived key. No inbox permission.
export async function drainNotifications(
  limit = 5,
  dependencies = {
    bridge: callBridge,
    transport: fetch,
    environment: process.env,
  },
) {
  const endpoint = dependencies.environment.LIVE_EMAIL_BRIDGE_URL;
  const bridgeSecret = dependencies.environment.LIVE_SHEETS_BRIDGE_SECRET;
  if (!endpoint || !bridgeSecret || !liveAvailable(dependencies.environment))
    return;
  const url = new URL(endpoint);
  if (
    url.origin !== "https://script.google.com" ||
    !/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname) ||
    url.search
  )
    return;
  const secret = createHmac("sha256", bridgeSecret)
    .update("maxupport-live-mail-key-v1")
    .digest("hex");
  const startedAt = Date.now();
  for (let i = 0; i < limit; i++) {
    if (Date.now() - startedAt > 20000) return;
    let claim: Record<string, unknown>;
    try {
      claim = await dependencies.bridge({ operation: "notificationClaim" });
    } catch {
      return;
    }
    if (claim.ok !== true || !claim.mail || typeof claim.mail !== "object")
      return;
    const mail = claim.mail as Record<string, unknown>;
    let status = "需人工確認";
    try {
      const timestamp = Date.now(),
        payload = JSON.stringify(mail);
      const signature = createHmac("sha256", secret)
        .update(`live-mail.${timestamp}.${payload}`)
        .digest("hex");
      const response = await dependencies.transport(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timestamp, payload, signature }),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (response.ok && result?.ok === true && result.id === mail.id)
        status = "已寄送";
      else if (result?.quota === true) status = "額度不足";
    } catch {
      /* Unknown delivery must not be silently retried. */
    }
    try {
      await dependencies.bridge({
        operation: "notificationResult",
        id: mail.id,
        status,
      });
    } catch {
      return;
    }
    if (status !== "已寄送") return;
  }
}
