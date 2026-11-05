import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
const source = readFileSync(new URL("./Code.gs", import.meta.url), "utf8");
function harness() {
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
    Utilities: {
      DigestAlgorithm: { SHA_256: "sha256" },
      Charset: { UTF_8: "utf8" },
      computeDigest: (_, text) => [
        ...createHash("sha256").update(text).digest(),
      ],
    },
    SpreadsheetApp: { flush: () => {} },
  });
  vm.runInContext(source, context);
  const call = (request) =>
    JSON.parse(JSON.stringify(context.liveAdminOperation(request, book)));
  return { call, tables };
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
