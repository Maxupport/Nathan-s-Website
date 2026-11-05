import assert from "node:assert/strict";
import { test } from "node:test";
import {
  demoSongs,
  generate,
  initialShows,
  previousIds,
  warnings,
  transitionShow,
} from "./model.ts";

test("manual show lifecycle keeps current, next and history independent", () => {
  const upcoming = { ...show(), status: "next" };
  const draft = { ...show(), id: "later", sequence: 2 };
  const started = transitionShow([upcoming, draft], "test", "start");
  assert.equal(started[0].status, "current");
  assert.equal(upcoming.status, "next");
  const withNext = [started[0], { ...draft, status: "next" }];
  assert.throws(() => transitionShow(withNext, "later", "start"));
  assert.throws(() => transitionShow(withNext, "later", "finish"));
  const finished = transitionShow(withNext, "test", "finish");
  assert.equal(finished[0].status, "performed");
  assert.equal(finished[1].status, "next");
  assert.equal(transitionShow(finished, "later", "start")[1].status, "current");
});

function show(items = generate(demoSongs, "oldies", "")) {
  return {
    id: "test",
    sequence: 1,
    date: "",
    location: "",
    copy: "",
    mode: "oldies",
    artist: "",
    items,
    status: "draft",
    overrideWarnings: [],
  };
}
test("oldies generation satisfies all fixed slots and includes showcase without duplicates", () => {
  for (let i = 0; i < 100; i++) {
    const result = show();
    assert.equal(result.items.length, 12);
    assert.deepEqual(warnings(result, demoSongs), []);
  }
});
test("artist topic can overlap a category without starving other slots", () => {
  const result = show(generate(demoSongs, "artist", "薛之謙", [], () => 0.5));
  result.mode = "artist";
  result.artist = "薛之謙";
  // Five artist slots plus two China slots need seven distinct China songs; only six exist.
  assert.ok(result.items.length < 12);
  assert.ok(warnings(result, demoSongs).length > 0);
  const expanded = [
    ...demoSongs,
    { ...demoSongs[12], id: "extra", title: "額外示例歌" },
  ];
  const valid = { ...result, items: generate(expanded, "artist", "薛之謙") };
  assert.deepEqual(warnings(valid, expanded), []);
  assert.equal(new Set(valid.items.map((i) => i.song.id)).size, 12);
});
test("disabled songs and excluded history are never silently selected", () => {
  const songs = demoSongs.map((s, i) => ({ ...s, ready: i !== 0 }));
  const excluded = [demoSongs[1].id, demoSongs[18].id];
  const items = generate(songs, "oldies", "", excluded);
  assert.ok(
    items.every(
      (i) => i.song.id !== demoSongs[0].id && !excluded.includes(i.song.id),
    ),
  );
});
test("shortages stay visible instead of substituting unrelated categories", () => {
  const songs = demoSongs.filter((s) => s.category !== "英文");
  const result = show(generate(songs, "oldies", ""));
  assert.equal(result.items.filter((i) => i.slot === "英文").length, 0);
  assert.ok(
    warnings(result, songs).some((w) => w.includes("英文應有 2 首，目前 0 首")),
  );
});
test("recent history only counts the last three completed shows", () => {
  const history = [1, 2, 3, 4].map((sequence, i) => ({
    ...show([{ song: demoSongs[i], slot: "機動" }]),
    sequence,
    status: "performed",
  }));
  assert.deepEqual(previousIds([...history, { ...show(), sequence: 5 }]), [
    "demo-4",
    "demo-3",
    "demo-2",
  ]);
});
test("initial batch has two editable and distinct drafts", () => {
  const shows = initialShows();
  assert.equal(shows.length, 2);
  assert.ok(shows.every((s) => s.status === "draft"));
  assert.notDeepEqual(
    shows[0].items.map((i) => i.song.id),
    shows[1].items.map((i) => i.song.id),
  );
});
test("manual override reports duplicate, disabled, wrong slot and recent songs", () => {
  const song = { ...demoSongs[0], ready: false, showcase: false };
  const result = show([
    { song, slot: "英文" },
    { song, slot: "英文" },
  ]);
  const messages = warnings(result, [song], [song.id]).join(" ");
  for (const message of [
    "重複歌曲",
    "不可上場",
    "不符合英文",
    "最近三場",
    "炫技",
  ])
    assert.ok(messages.includes(message));
});
