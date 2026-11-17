import assert from "node:assert/strict";
import { test } from "node:test";
import {
  decodeAdmin,
  parseChanges,
  parseShow,
  changesSince,
} from "./admin-state.ts";
const song = {
  id: "S001",
  title: "歌曲",
  artist: "歌手",
  category: "",
  ready: true,
  serious: false,
  showcase: false,
  opener: false,
};
const show = {
  id: "show-1",
  sequence: 1,
  date: "",
  location: "",
  copy: "",
  mode: "oldies",
  artist: "",
  items: [],
  status: "draft",
  overrideWarnings: [],
};
test("native Sheet decoding preserves blank classifications and uses the real song library", () => {
  const data = decodeAdmin({
    revision: "a".repeat(64),
    songs: [
      ["S001", "歌曲", "歌手", "", "否", "是", "否", "是", "Kala", "keep"],
    ],
    shows: [],
    submissions: [],
  });
  assert.equal(data.songs[0].category, "");
  assert.equal(data.songs[0].showcase, true);
  assert.equal(data.songs[0].kala, undefined);
});
test("save diffs modify only changed songs and explicit raw-record actions", () => {
  const submission = {
    id: "raw-1",
    nickname: "原始",
    email: "private@example.com",
    instagram: "",
    message: "private",
    status: "待處理",
  };
  const before = {
    songs: [song],
    shows: [show],
    submissions: [submission],
    revision: "a".repeat(64),
  };
  assert.deepEqual(changesSince(before, before), {
    songs: [],
    shows: null,
    submissions: [],
  });
  const changes = changesSince(before, {
    ...before,
    songs: [{ ...song, category: "台文" }],
    submissions: [
      {
        ...submission,
        nickname: "已匿名",
        email: "",
        message: "",
        status: "已完成",
      },
    ],
  });
  assert.equal(changes.songs.length, 1);
  assert.deepEqual(changes.submissions, [
    { id: "raw-1", action: "anonymize" },
    { id: "raw-1", action: "status", status: "已完成" },
  ]);
  assert.deepEqual(
    changesSince(before, { ...before, submissions: [] }).submissions,
    [{ id: "raw-1", action: "delete" }],
  );
});
test("public show reconstruction strips contact fields and draft publishing requires valid metadata", () => {
  const published = {
    ...show,
    status: "next",
    date: "2026-11-06T18:30",
    location: "測試街角",
    items: [{ slot: "機動", song: { ...song, email: "private" } }],
    email: "private",
  };
  const clean = parseShow(published);
  assert.equal(clean.email, undefined);
  assert.equal(clean.items[0].song.email, undefined);
  assert.throws(() => parseShow({ ...published, date: "" }));
  assert.throws(() =>
    parseChanges({
      songs: [],
      shows: [published, { ...published, id: "show-2" }],
      submissions: [],
    }),
  );
  assert.throws(() =>
    parseChanges({
      songs: [],
      shows: null,
      submissions: [{ id: "1", action: "overwrite", email: "bad" }],
    }),
  );
});
