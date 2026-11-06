import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { test } from "node:test";

const source = readFileSync(new URL("./Code.gs", import.meta.url), "utf8");
const headers = [
  "提交 ID",
  "保存時間",
  "類型",
  "主題",
  "暱稱",
  "Email",
  "Instagram",
  "歌曲",
  "演唱者",
  "內容",
  "回覆同意版本",
  "訂閱同意",
  "互動事件",
  "處理狀態",
  "通知狀態",
];
function harness(activeEmail = "") {
  const rows = [headers];
  let held = false;
  const properties = {
    LIVE_BRIDGE_SECRET: "x".repeat(40),
    LIVE_SPREADSHEET_ID: "test-only",
  };
  const cache = new Map();
  const sheet = {
    getLastRow: () => rows.length,
    getRange(row, column) {
      return {
        getValues: () => [rows[row - 1]],
        getValue: () => rows[row - 1][column - 1],
        setValues: (values) => {
          rows[row - 1] = [...values[0]];
        },
        createTextFinder: (text) => ({
          matchEntireCell: () => ({
            findNext: () => {
              const index = rows.findIndex((r, i) => i > 0 && r[0] === text);
              return index === -1 ? null : { getRow: () => index + 1 };
            },
          }),
        }),
      };
    },
  };
  const context = vm.createContext({
    HtmlService: { createHtmlOutput: (html) => ({ addMetaTag: () => html }) },
    Session: {
      getActiveUser: () => ({ getEmail: () => activeEmail }),
      getEffectiveUser: () => {
        throw new Error("Effective user must never authorize login");
      },
    },
    ContentService: {
      MimeType: { JSON: "application/json" },
      createTextOutput: (text) => ({ setMimeType: () => JSON.parse(text) }),
    },
    PropertiesService: {
      getScriptProperties: () => ({ getProperty: (key) => properties[key] }),
    },
    Utilities: {
      base64EncodeWebSafe: (value) => Buffer.from(value).toString("base64url"),
      Charset: { UTF_8: "utf8" },
      computeHmacSha256Signature: (value, secret) => [
        ...createHmac("sha256", secret).update(value).digest(),
      ],
    },
    LockService: {
      getScriptLock: () => ({
        tryLock: () => {
          assert.equal(held, false);
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
    SpreadsheetApp: {
      openById: () => ({
        getSheetByName: () => {
          assert.equal(held, true);
          return sheet;
        },
      }),
      flush: () => assert.equal(held, true),
    },
  });
  vm.runInContext(source, context);
  function envelope(submission, timestamp = Date.now()) {
    const payload = JSON.stringify({ operation: "submit", submission });
    const signature = createHmac("sha256", properties.LIVE_BRIDGE_SECRET)
      .update(`${timestamp}.${payload}`)
      .digest("hex");
    return {
      postData: { contents: JSON.stringify({ timestamp, payload, signature }) },
    };
  }
  return { rows, context, envelope, locked: () => held, cache };
}
const submission = {
  id: "11111111-1111-4111-8111-111111111111",
  kind: "提問",
  replyConsent: true,
  consentVersion: "live-reply-v1",
  message: '=IMPORTXML("bad")',
  topic: "聲音優化",
  events: [],
};
test("script persists, releases lock, escapes formulas and deduplicates a retried submission", () => {
  const h = harness();
  const first = h.context.doPost(h.envelope(submission));
  assert.equal(first.ok, true);
  assert.equal(h.locked(), false);
  assert.equal(h.rows.length, 2);
  assert.ok(h.rows[1][9].startsWith("'="));
  const retry = h.context.doPost(h.envelope(submission));
  assert.equal(retry.duplicate, true);
  assert.equal(retry.savedAt, first.savedAt);
  assert.equal(h.rows.length, 2);
});
test("Google login refuses anonymous or different active users and arbitrary return URLs", () => {
  const request = {
    parameter: {
      state: "a".repeat(64),
      returnTo: "http://localhost:3100/live/auth",
    },
  };
  for (const email of ["", "other@gmail.com"]) {
    const page = harness(email).context.doGet(request);
    assert.ok(!page.includes("#proof="));
    assert.ok(page.includes('href="https://www.maxupport.space/api/live/auth/login"'));
    assert.ok(page.includes("登入／切換 Google 帳號"));
  }
  const owner = harness("maxupport@gmail.com");
  assert.ok(owner.context.doGet(request).includes("#proof="));
  assert.ok(
    !owner.context
      .doGet({
        parameter: {
          ...request.parameter,
          returnTo: "https://evil.example/live/auth",
        },
      })
      .includes("#proof="),
  );
  assert.ok(
    !owner.context
      .doGet({ parameter: { ...request.parameter, state: "wrong" } })
      .includes("#proof="),
  );
  const malicious = owner.context.doGet({parameter: {
    state: request.parameter.state, returnTo: 'https://evil.example/\"><script>alert(1)</script>',
  }});
  assert.ok(!malicious.includes("evil.example"));
  assert.ok(!malicious.includes("<script>"));
});
test("invalid signatures and stale envelopes do not write", () => {
  const h = harness();
  assert.equal(
    h.context.doPost(h.envelope(submission, Date.now() - 600000)).ok,
    false,
  );
  const request = h.envelope(submission);
  const body = JSON.parse(request.postData.contents);
  body.signature = "0".repeat(64);
  request.postData.contents = JSON.stringify(body);
  assert.equal(h.context.doPost(request).ok, false);
  assert.equal(h.rows.length, 1);
  assert.equal(h.locked(), false);
});
test("existing headers are checked rather than overwritten", () => {
  const h = harness();
  h.rows[0] = ["other spreadsheet"];
  assert.equal(h.context.doPost(h.envelope(submission)).ok, false);
  assert.deepEqual(h.rows[0], ["other spreadsheet"]);
  assert.equal(h.rows.length, 1);
  assert.equal(h.locked(), false);
});
test("signed read polling does not acquire the write lock while admin mutations do", () => {
  const h = harness();
  for (const operation of ["publicRead", "adminRead", "adminSave"]) {
    h.context.liveAdminOperation = () => {
      assert.equal(h.locked(), operation === "adminSave");
      return { ok: true };
    };
    const timestamp = Date.now(),
      payload = JSON.stringify({ operation });
    const signature = createHmac("sha256", "x".repeat(40))
      .update(`${timestamp}.${payload}`)
      .digest("hex");
    assert.equal(
      h.context.doPost({
        postData: {
          contents: JSON.stringify({ timestamp, payload, signature }),
        },
      }).ok,
      true,
    );
    assert.equal(h.locked(), false);
  }
});
