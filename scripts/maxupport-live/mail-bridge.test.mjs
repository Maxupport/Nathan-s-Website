import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
const source = readFileSync(
  new URL("./MailBridge.gs", import.meta.url),
  "utf8",
);
function harness({ quota = 100, throws = false } = {}) {
  const secret = "m".repeat(64),
    cache = new Map(),
    sent = [];
  let held = false;
  const context = vm.createContext({
    ContentService: {
      MimeType: { JSON: "json" },
      createTextOutput: (text) => ({ setMimeType: () => JSON.parse(text) }),
    },
    PropertiesService: {
      getScriptProperties: () => ({ getProperty: () => secret }),
    },
    Utilities: {
      Charset: { UTF_8: "utf8" },
      computeHmacSha256Signature: (text, key) => [
        ...createHmac("sha256", key).update(text).digest(),
      ],
    },
    LockService: {
      getScriptLock: () => ({
        tryLock: () => {
          held = true;
          return true;
        },
        hasLock: () => held,
        releaseLock: () => {
          held = false;
        },
      }),
    },
    CacheService: {
      getScriptCache: () => ({
        get: (key) => cache.get(key),
        put: (key, value) => cache.set(key, value),
      }),
    },
    MailApp: {
      getRemainingDailyQuota: () => quota,
      sendEmail: (mail) => {
        sent.push(mail);
        if (throws) throw new Error("uncertain delivery");
      },
    },
  });
  vm.runInContext(source, context);
  const call = (mail, timestamp = Date.now(), key = secret) => {
    const payload = JSON.stringify(mail),
      signature = createHmac("sha256", key)
        .update(`live-mail.${timestamp}.${payload}`)
        .digest("hex");
    return context.doPost({
      postData: { contents: JSON.stringify({ timestamp, payload, signature }) },
    });
  };
  return { call, sent, locked: () => held };
}
const sample = {
  id: "a".repeat(64),
  to: "maxupport@gmail.com",
  subject: "[Maxupport LIVE] 系統測試",
  body: "測試內容",
};
test("mail bridge requires signature, expiry, single recipient and safe subject", () => {
  const h = harness();
  assert.equal(h.call(sample, Date.now() - 600000).ok, false);
  assert.equal(h.call(sample, Date.now(), "wrong").ok, false);
  for (const bad of [
    { to: "one@example.com,two@example.com" },
    { to: "one@example.com;two@example.com" },
    { subject: "arbitrary" },
    { subject: "[Maxupport LIVE] a\nBcc: bad@example.com" },
  ])
    assert.equal(h.call({ ...sample, ...bad }).ok, false);
  assert.equal(h.sent.length, 0);
});
test("confirmed mail retries return a receipt without sending again", () => {
  const h = harness();
  assert.equal(h.call(sample).ok, true);
  assert.equal(h.call(sample).duplicate, true);
  assert.equal(h.sent.length, 1);
  assert.equal(h.locked(), false);
  assert.equal(h.sent[0].htmlBody, undefined);
  assert.equal(h.sent[0].bcc, undefined);
});
test("quota and uncertain sends remain visible and never silently resend", () => {
  const low = harness({ quota: 0 });
  assert.equal(low.call(sample).quota, true);
  assert.equal(low.sent.length, 0);
  const unknown = harness({ throws: true });
  assert.equal(unknown.call(sample).uncertain, true);
  assert.equal(unknown.call(sample).uncertain, true);
  assert.equal(unknown.sent.length, 1);
});
