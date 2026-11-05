import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { drainNotifications } from "./mail.ts";
test("queue drain marks sent only for a matching mail receipt and signs with a separate key", async () => {
  const calls = [],
    mail = {
      id: "a".repeat(64),
      to: "maxupport@gmail.com",
      subject: "[Maxupport LIVE] test",
      body: "test",
    };
  const environment = {
    LIVE_EMAIL_BRIDGE_URL: "https://script.google.com/macros/s/mail-test/exec",
    LIVE_SHEETS_BRIDGE_SECRET: "s".repeat(64),
  };
  const bridge = async (request) => {
    calls.push(request);
    return request.operation === "notificationClaim"
      ? { ok: true, mail }
      : { ok: true };
  };
  await drainNotifications(1, {
    environment,
    bridge,
    transport: async (url, init) => {
      const e = JSON.parse(init.body),
        key = createHmac("sha256", environment.LIVE_SHEETS_BRIDGE_SECRET)
          .update("maxupport-live-mail-key-v1")
          .digest("hex");
      assert.equal(
        e.signature,
        createHmac("sha256", key)
          .update(`live-mail.${e.timestamp}.${e.payload}`)
          .digest("hex"),
      );
      return Response.json({ ok: true, id: mail.id });
    },
  });
  assert.equal(calls[1].status, "已寄送");
  for (const response of [
    () => Response.json({ ok: true, id: "wrong" }),
    () => {
      throw new Error("lost");
    },
    () => Response.json({ ok: false, quota: true }),
  ]) {
    calls.length = 0;
    await drainNotifications(1, {
      environment,
      bridge,
      transport: async () => response(),
    });
    assert.notEqual(calls[1].status, "已寄送");
  }
});
test("unconfigured notification service cannot claim an email", async () => {
  await drainNotifications(1, {
    environment: {},
    bridge: async () => {
      throw new Error("must not claim");
    },
    transport: fetch,
  });
});
