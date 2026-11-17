import assert from "node:assert/strict";
import { test } from "node:test";
import { submitInteraction, SubmissionError } from "./submit.ts";

test("browser accepts only a confirmed matching receipt", async () => {
  const payload = { id: "fixed-retry-id", message: "test" };
  const transport = async (url, init) => {
    assert.equal(url, "/api/live/submissions");
    assert.deepEqual(JSON.parse(init.body), payload);
    assert.equal(init.credentials, "same-origin");
    return Response.json({ id: payload.id, savedAt: "2026-11-06T00:00:00Z" });
  };
  assert.equal((await submitInteraction(payload, transport)).id, payload.id);
  for (const response of [
    Response.json({ id: payload.id }, { status: 503 }),
    Response.json({ id: "different", savedAt: "2026-11-06T00:00:00Z" }),
    Response.json({ id: payload.id, savedAt: "invalid" }),
    new Response("<html>Login required</html>"),
  ])
    await assert.rejects(submitInteraction(payload, async () => response));
});
test("definitive validation rejection permits editing while uncertain writes retain the attempt", async () => {
  await assert.rejects(
    submitInteraction({ id: "test" }, async () =>
      Response.json({ error: "請填寫有效的 Email。" }, { status: 400 }),
    ),
    (error) =>
      error instanceof SubmissionError &&
      !error.retryable &&
      error.message.includes("Email"),
  );
  await assert.rejects(
    submitInteraction({ id: "test" }, async () =>
      Response.json({ error: "upstream unavailable" }, { status: 503 }),
    ),
    (error) => error instanceof SubmissionError && error.retryable,
  );
});

test("a lost response can retry the same immutable payload", async () => {
  const payload = Object.freeze({ id: "same-id", message: "original" });
  const sent = [];
  const transport = async (_, init) => {
    sent.push(init.body);
    if (sent.length === 1) throw new Error("connection lost after write");
    return Response.json({
      id: payload.id,
      savedAt: "2026-11-06T00:00:00Z",
      duplicate: true,
    });
  };
  await assert.rejects(submitInteraction(payload, transport));
  await submitInteraction(payload, transport);
  assert.equal(sent[0], sent[1]);
});
