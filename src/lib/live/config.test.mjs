import assert from "node:assert/strict";
import { test } from "node:test";
import { liveAvailable } from "./config.ts";
test("production release requires explicit opt-in while preview stays available", () => {
  assert.equal(liveAvailable({ VERCEL_ENV: "production" }), false);
  assert.equal(
    liveAvailable({ VERCEL_ENV: "production", LIVE_RELEASE_ENABLED: "false" }),
    false,
  );
  assert.equal(
    liveAvailable({ VERCEL_ENV: "production", LIVE_RELEASE_ENABLED: "true" }),
    true,
  );
  assert.equal(liveAvailable({ VERCEL_ENV: "preview" }), true);
});
