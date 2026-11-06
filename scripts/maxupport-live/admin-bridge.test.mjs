import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
const source = readFileSync(new URL("./Code.gs", import.meta.url), "utf8");
function harness(enabled = false) {
  const tables = {
    歌曲主資料: [
      ["歌曲 ID"],
      [
        "S001",
        "歌",
        "歌手",
        "",
        "否",
        "否",
        "否",
        "是",
        "是",
        "https://example.com/kala",
        "video",
        "source",
        0,
        "",
        "待核對",
        1,
        "keep",
      ],
    ],
    互動原始紀錄: [
      ["提交 ID"],
      [
        "raw-1",
        "2026-11-06T00:00:00Z",
        "鼓勵",
        "",
        "私名",
        "private@example.com",
        "private-ig",
        "",
        "",
        "private-message",
        "live-reply-v1",
        "否",
        "[]",
        "待處理",
        "尚未通知",
      ],
    ],
  };
  function sheet(name) {
    const rows = tables[name];
    if (!rows) return null;
    return {
      getLastRow: () => rows.length,
      setFrozenRows: () => {},
      deleteRow: (r) => rows.splice(r - 1, 1),
      getRange: (r, c, h = 1, w = 1) => ({
        getValue: () => rows[r - 1]?.[c - 1] ?? "",
        getValues: () =>
          Array.from({ length: h }, (_, i) =>
            Array.from(
              { length: w },
              (_, j) => rows[r + i - 1]?.[c + j - 1] ?? "",
            ),
          ),
        setValue: (v) => {
          rows[r - 1] ??= [];
          rows[r - 1][c - 1] = v;
        },
        setValues: (values) =>
          values.forEach((row, i) => {
            rows[r + i - 1] ??= [];
            row.forEach((v, j) => (rows[r + i - 1][c + j - 1] = v));
          }),
        clearContent: () => {
          for (let i = 0; i < h; i++)
            for (let j = 0; j < w; j++)
              if (rows[r + i - 1]) rows[r + i - 1][c + j - 1] = "";
        },
      }),
    };
  }
  const book = {
    getSheetByName: sheet,
    insertSheet: (name) => {
      tables[name] = [];
      return sheet(name);
    },
  };
  const context = vm.createContext({
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key) =>
          key === "LIVE_BRIDGE_SECRET" ? "x".repeat(40) : key === "LIVE_NOTIFICATIONS_ENABLED" && enabled ? "true" : null,
      }),
    },
    Utilities: {
      DigestAlgorithm: { SHA_256: "sha256" },
      Charset: { UTF_8: "utf8" },
      computeDigest: (_, text) => [
        ...createHash("sha256").update(text).digest(),
      ],
      computeHmacSha256Signature: (text, secret) => [...createHmac("sha256", secret).update(text).digest()],
    },
    SpreadsheetApp: { flush: () => {} },
  });
  vm.runInContext(source, context);
  const call = (request) =>
    JSON.parse(JSON.stringify(context.liveAdminOperation(request, book)));
  return {
    call,
    tables,
    subscribe: (email, id) => context.liveSubscribe(book, email, id),
    unsubscribe: (id, token) => context.liveUnsubscribe({id, token}, book),
    token: (id) => context.liveUnsubscribeToken(id),
    preference: (email, submissionId, choice, token) => {
      const receipt = context.livePreferenceReceipt(book, email, submissionId);
      return context.liveSubscriptionPreference({...receipt, choice, ...(token ? {token} : {})}, book);
    },
    notification: (request) =>
      JSON.parse(
        JSON.stringify(context.liveNotificationOperation(request, book)),
      ),
    enqueue: (type, id, showId = "") =>
      context.liveQueueNotice(book, type, id, showId),
  };
}
test("public projection excludes draft shows and never returns private intake", () => {
  const h = harness();
  const base = { id: "draft", status: "draft" };
  const published = {
    id: "public",
    status: "next",
    items: [],
    email: "private",
  };
  h.tables["LIVE 演出資料"] = [
    ["場次 ID", "資料 JSON"],
    ["draft", JSON.stringify(base)],
    ["public", JSON.stringify(published)],
  ];
  const result = h.call({ operation: "publicRead" });
  assert.equal(result.shows.length, 1);
  assert.equal(result.shows[0].email, undefined);
  assert.equal(result.submissions, undefined);
  assert.ok(!JSON.stringify(result).includes("private"));
});
test("unperformed drafts can be deleted but completed records and their images are immutable", () => {
  const h = harness();
  const show = {id:"archive-test",sequence:1,status:"current",date:"2026-11-06T18:30",location:"測試街角",items:[{song:{title:"歌<&>",artist:"歌手"},slot:"機動"}]};
  h.tables["LIVE 演出資料"] = [["場次 ID","資料 JSON"],[show.id,JSON.stringify(show)]];
  const save = (shows) => h.call({operation:"adminSave",revision:h.call({operation:"adminRead"}).revision,changes:{songs:[],shows,submissions:[]}});
  assert.equal(save([]).ok,false);
  const result = save([{...show,status:"performed"}]);
  assert.equal(result.ok,true);
  const archived = h.call({operation:"adminRead"}).shows[0];
  assert.ok(archived.recordImage.startsWith("data:image/svg+xml"));
  assert.ok(decodeURIComponent(archived.recordImage).includes("歌&lt;&amp;&gt;"));
  assert.equal(save([]).ok,false);
  assert.equal(save([{...archived,location:"改動"}]).ok,false);
  assert.equal(save([{...archived,recordImage:"改動"}]).ok,false);
  assert.equal(save([{...archived}]).ok,true);
  const withoutImage = {...archived}; delete withoutImage.recordImage;
  assert.equal(save([withoutImage]).ok,true);
  assert.equal(h.call({operation:"adminRead"}).shows[0].recordImage, archived.recordImage);
  assert.equal(save([archived,{...show,id:"draft",status:"draft"}]).ok,true);
  assert.equal(save([archived]).ok,true);
});
test("performance subscription deduplicates email, respects unsubscribe and cannot be revived by an old retry", () => {
  const h = harness(true);
  h.subscribe(" Max@Example.com ", "first");
  const subscriber = h.tables["LIVE 演出訂閱"][1];
  assert.equal(subscriber[1], "max@example.com");
  assert.equal(h.unsubscribe(subscriber[0], "wrong").ok, false);
  assert.equal(h.unsubscribe(subscriber[0], h.token(subscriber[0])).ok, true);
  assert.equal(subscriber[2], "已取消訂閱");
  h.subscribe("max@example.com", "first");
  assert.equal(subscriber[2], "已取消訂閱");
  h.subscribe("MAX@example.com", "new-consented-submission");
  assert.equal(h.tables["LIVE 演出訂閱"].length, 2);
  assert.equal(h.tables["LIVE 演出訂閱"][1][2], "預設接收（未回答）");
});
test("post-submit preference distinguishes default delivery, explicit yes and explicit no with a signed receipt", () => {
  const h = harness(true);
  h.subscribe("choice@example.com", "request");
  const row = h.tables["LIVE 演出訂閱"][1];
  assert.equal(row[2], "預設接收（未回答）");
  assert.equal(row[3], "live-updates-default-v1");
  assert.equal(h.preference("choice@example.com", "request", "yes", "bad").ok, false);
  assert.equal(row[2], "預設接收（未回答）");
  assert.equal(h.preference("choice@example.com", "request", "yes").ok, true);
  assert.equal(row[2], "訂閱中");
  assert.equal(row[3], "live-updates-v1");
  assert.equal(h.preference("choice@example.com", "request", "no").ok, true);
  assert.equal(row[2], "不同意");
  h.subscribe("choice@example.com", "request");
  assert.equal(row[2], "不同意");
});
test("publishing queues one complete announcement per subscriber, never enrolls old contacts or repeats on edits", () => {
  const h = harness(true);
  h.subscribe("private@example.com", "raw-1");
  const show = { id: "announce-show", sequence: 5, status: "next", date: "2026-11-06T18:30", location: "測試街角", copy: "演出預告", items: [{song: {title: "歌", artist: "歌手"}}] };
  h.tables["互動原始紀錄"][1][2] = "點歌";
  h.tables["互動原始紀錄"][1][7] = "歌";
  h.tables["互動原始紀錄"][1][8] = "歌手";
  h.call({operation: "adminSave", revision: h.call({operation: "adminRead"}).revision, changes: {songs: [], shows: [show], submissions: []}});
  assert.equal(h.tables["LIVE 通知佇列"].length, 2);
  const mail = h.notification({operation: "notificationClaim"}).mail;
  assert.equal(mail.to, "private@example.com");
  assert.ok(mail.body.includes("2026-11-06 18:30"));
  assert.ok(mail.body.includes("測試街角"));
  assert.ok(mail.body.includes("歌 — 歌手"));
  assert.ok(mail.body.includes("/api/live/unsubscribe?id="));
  h.notification({operation: "notificationResult", id: mail.id, status: "已寄送"});
  assert.equal(h.tables["互動原始紀錄"][1][14], "演出預告已寄送");
  h.call({operation: "adminSave", revision: h.call({operation: "adminRead"}).revision, changes: {songs: [], shows: [{...show, copy: "更新文案"}], submissions: []}});
  assert.equal(h.tables["LIVE 通知佇列"].length, 2);
  assert.equal(h.tables["LIVE 演出訂閱"].length, 2);
});
test("unsubscribed or removed subscribers never receive pending announcements", () => {
  const h = harness(true);
  h.subscribe("private@example.com", "raw-1");
  const id = h.tables["LIVE 演出訂閱"][1][0];
  h.tables["LIVE 演出資料"] = [["場次 ID", "資料 JSON"], ["show", JSON.stringify({id: "show", status: "next"})]];
  h.enqueue("announcement", id, "show");
  h.unsubscribe(id, h.token(id));
  assert.equal(h.notification({operation: "notificationClaim"}).mail, null);
  assert.equal(h.tables["LIVE 通知佇列"][1][4], "已取消");
  h.subscribe("private@example.com", "new");
  h.call({operation: "adminSave", revision: h.call({operation: "adminRead"}).revision, changes: {songs: [], shows: null, submissions: [{id: "raw-1", action: "anonymize"}]}});
  assert.equal(h.tables["LIVE 演出訂閱"][1][1], "");
  assert.equal(h.tables["LIVE 演出訂閱"][1][2], "已移除聯絡資料");
});
test("durable notices deduplicate claims and never copy audience message into owner email", () => {
  const h = harness(true);
  h.enqueue("owner", "raw-1");
  h.enqueue("owner", "raw-1");
  assert.equal(h.tables["LIVE 通知佇列"].length, 2);
  const claim = h.notification({ operation: "notificationClaim" });
  assert.equal(claim.mail.to, "maxupport@gmail.com");
  assert.ok(!claim.mail.body.includes("private-message"));
  assert.equal(h.notification({ operation: "notificationClaim" }).mail, null);
  assert.equal(
    h.notification({
      operation: "notificationResult",
      id: claim.mail.id,
      status: "已寄送",
    }).ok,
    true,
  );
  assert.equal(h.tables["LIVE 通知佇列"][1][4], "已寄送");
});
test("published matching request queues audience notification and includes complete show details", () => {
  const h = harness(true);
  h.tables["互動原始紀錄"][1][2] = "點歌";
  h.tables["互動原始紀錄"][1][7] = "歌";
  h.tables["互動原始紀錄"][1][8] = "歌手";
  const first = h.call({ operation: "adminRead" });
  const show = {
    id: "show-1",
    sequence: 1,
    status: "next",
    date: "2026-11-06T18:30",
    location: "測試街角",
    copy: "一起聽歌",
    items: [{ song: { title: "歌", artist: "歌手" } }],
  };
  h.call({
    operation: "adminSave",
    revision: first.revision,
    changes: { songs: [], shows: [show], submissions: [] },
  });
  const claim = h.notification({ operation: "notificationClaim" });
  assert.equal(claim.mail.to, "private@example.com");
  assert.ok(claim.mail.body.includes("測試街角"));
  assert.ok(claim.mail.body.includes("完整歌單"));
  assert.equal(h.tables["歌曲主資料"][1][12], 1);
  h.notification({
    operation: "notificationResult",
    id: claim.mail.id,
    status: "需人工確認",
  });
  assert.equal(h.notification({ operation: "notificationClaim" }).mail, null);
});
test("conflict rejects writes; targeted library save preserves Kala metadata and new intake", () => {
  const h = harness(),
    first = h.call({ operation: "adminRead" });
  const changes = {
    songs: [
      {
        id: "S001",
        title: "歌",
        artist: "歌手",
        category: "台文",
        serious: false,
        showcase: true,
        opener: false,
        ready: true,
      },
    ],
    shows: null,
    submissions: [{ id: "raw-1", action: "status", status: "已完成" }],
  };
  h.tables["歌曲主資料"][1][3] = "老歌";
  assert.equal(
    h.call({ operation: "adminSave", revision: first.revision, changes })
      .conflict,
    true,
  );
  assert.equal(h.tables["歌曲主資料"][1][3], "老歌");
  const latest = h.call({ operation: "adminRead" });
  h.tables["互動原始紀錄"].push(["new-arrival"]);
  assert.equal(
    h.call({ operation: "adminSave", revision: latest.revision, changes }).ok,
    true,
  );
  assert.equal(h.tables["歌曲主資料"][1][9], "https://example.com/kala");
  assert.equal(h.tables["歌曲主資料"][1][16], "keep");
  assert.equal(h.tables["互動原始紀錄"][1][13], "已完成");
  assert.equal(h.tables["互動原始紀錄"][2][0], "new-arrival");
});
test("shows persist as snapshots; anonymization affects only explicit IDs", () => {
  const h = harness(),
    first = h.call({ operation: "adminRead" });
  const shows = [{ id: "show-1", sequence: 1, status: "draft", items: [] }];
  assert.equal(
    h.call({
      operation: "adminSave",
      revision: first.revision,
      changes: {
        songs: [],
        shows,
        submissions: [{ id: "raw-1", action: "anonymize" }],
      },
    }).ok,
    true,
  );
  const loaded = h.call({ operation: "adminRead" });
  assert.deepEqual(loaded.shows, shows);
  assert.equal(loaded.submissions[0][5], "");
  assert.equal(loaded.submissions[0][9], "");
  assert.equal(loaded.submissions[0][0], "raw-1");
});
