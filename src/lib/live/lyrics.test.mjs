import assert from "node:assert/strict";
import {test} from "node:test";
import {safeLyricsUrl} from "./lyrics.ts";
test("lyrics links accept HTTPS only and reject scripts, credentials and malformed input", () => {
  assert.equal(safeLyricsUrl("https://music-tw.line.me/track/123"), "https://music-tw.line.me/track/123");
  for (const value of ["javascript:alert(1)", "data:text/html,bad", "http://example.com", "https://user:secret@example.com", "not a url", undefined]) assert.equal(safeLyricsUrl(value), "");
});
