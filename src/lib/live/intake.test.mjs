import assert from "node:assert/strict";
import { test } from "node:test";
import { parseIntake, signBridgePayload, writeIntake } from "./intake.ts";

const sample = () => ({
  id: "11111111-1111-4111-8111-111111111111",
  kind: "提問",
  topic: "聲音優化",
  nickname: "測試",
  email: "test@example.com",
  message: "測試聲音表達",
  replyConsent: true,
  subscriptionConsent: false,
  consentVersion: "live-reply-v1",
  events: [{ name: "submitted", at: "2026-11-05T13:00:00Z" }],
});
test("intake validates consent and contact, strips arbitrary fields and never accepts draft text events", () => {
  assert.equal(
    parseIntake({ ...sample(), ip: "private", draft: "do not save" }).ip,
    undefined,
  );
  for (const override of [
    { replyConsent: false },
    { consentVersion: "wrong" },
    { email: "" },
    { email: "one@example.com,two@example.com" },
    { email: "one@example.com;two@example.com" },
    { topic: "unknown" },
    { message: "x".repeat(2001) },
    { events: [{ name: "keystroke", at: "2026-11-05T13:00:00Z" }] },
  ])
    assert.throws(() => parseIntake({ ...sample(), ...override }));
});
test("song and subscription branches retain separate validation", () => {
  assert.throws(() => parseIntake({ ...sample(), kind: "點歌", topic: "" }));
  assert.equal(
    parseIntake({
      ...sample(),
      kind: "點歌",
      topic: "",
      title: "最近",
      artist: "李聖傑",
      email: "",
    }).title,
    "最近",
  );
  assert.throws(() => parseIntake({ ...sample(), kind: "訂閱", topic: "" }));
  assert.equal(
    parseIntake({
      ...sample(),
      kind: "訂閱",
      topic: "",
      subscriptionConsent: true,
    }).subscriptionConsent,
    true,
  );
});
test("bridge signs the exact payload and only accepts a matching saved receipt", async () => {
  const config = {
    url: "https://script.google.com/macros/s/example/exec",
    secret: "x".repeat(40),
  };
  let sent;
  const result = await writeIntake(
    parseIntake(sample()),
    config,
    async (url, init) => {
      sent = JSON.parse(init.body);
      assert.equal(
        sent.signature,
        signBridgePayload(sent.payload, sent.timestamp, config.secret),
      );
      assert.equal(JSON.parse(sent.payload).submission.topic, "聲音優化");
      return Response.json({
        ok: true,
        id: sample().id,
        savedAt: "2026-11-05T13:00:00Z",
        duplicate: false,
      });
    },
  );
  assert.equal(result.id, sample().id);
  for (const reply of [
    { ok: false },
    { ok: true, id: "wrong", savedAt: "2026-11-05T13:00:00Z" },
    { ok: true, id: sample().id },
  ])
    await assert.rejects(
      writeIntake(parseIntake(sample()), config, async () =>
        Response.json(reply),
      ),
    );
});
test("bridge refuses arbitrary endpoints and short secrets", async () => {
  await assert.rejects(
    writeIntake(parseIntake(sample()), {
      url: "https://example.com",
      secret: "x".repeat(40),
    }),
  );
  await assert.rejects(
    writeIntake(parseIntake(sample()), {
      url: "https://script.google.com/macros/s/example/exec",
      secret: "short",
    }),
  );
});
