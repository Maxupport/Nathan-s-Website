import assert from "node:assert/strict";
import { test } from "node:test";
import {
  signClaims,
  verifyOwnerProof,
  createOwnerSession,
  verifyOwnerSession,
} from "./auth-core.ts";
const secret = "s".repeat(64),
  state = "a".repeat(64),
  now = Date.now();
const claims = {
  purpose: "live-owner-proof",
  email: "maxupport@gmail.com",
  issuedAt: now,
  expiresAt: now + 60000,
  state,
};
test("owner proof requires owner, matching login state, purpose, signature and short expiry", () => {
  const proof = signClaims(claims, secret);
  assert.ok(verifyOwnerProof(proof, state, secret, now));
  assert.equal(verifyOwnerProof(proof, "b".repeat(64), secret, now), null);
  assert.equal(verifyOwnerProof(proof, state, "x".repeat(64), now), null);
  assert.equal(verifyOwnerProof(proof, state, secret, now + 60000), null);
  for (const override of [
    { email: "other@gmail.com" },
    { purpose: "submit" },
    { expiresAt: now + 60001 },
    { issuedAt: now + 6000 },
  ]) {
    assert.equal(
      verifyOwnerProof(
        signClaims({ ...claims, ...override }, secret),
        state,
        secret,
        now,
      ),
      null,
    );
  }
});
test("session is domain separated from proofs and expires after twelve hours", () => {
  const session = createOwnerSession(secret, now);
  assert.ok(verifyOwnerSession(session, secret, now));
  assert.equal(verifyOwnerSession(session, secret, now + 43200000), null);
  assert.equal(verifyOwnerProof(session, state, secret, now), null);
  assert.equal(
    verifyOwnerSession(signClaims(claims, secret), secret, now),
    null,
  );
  assert.equal(verifyOwnerSession(session + "extra", secret, now), null);
});
