import { createHmac, timingSafeEqual } from "node:crypto";

const owner = "maxupport@gmail.com";
type Claims = {
  purpose: string;
  email: string;
  issuedAt: number;
  expiresAt: number;
  state?: string;
};
function mac(payload: string, purpose: string, secret: string) {
  if (secret.length < 32) throw new Error("Login is not configured");
  return createHmac("sha256", secret)
    .update(`${purpose}.${payload}`)
    .digest("hex");
}
export function signClaims(claims: Claims, secret: string) {
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${payload}.${mac(payload, claims.purpose, secret)}`;
}
function verify(
  token: string,
  purpose: string,
  secret: string,
  maxLife: number,
  now: number,
): Claims | null {
  try {
    if (token.length > 2048 || secret.length < 32) return null;
    const [payload, signature, extra] = token.split(".");
    if (extra || !/^[a-f0-9]{64}$/.test(signature)) return null;
    const expected = mac(payload, purpose, secret);
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature)))
      return null;
    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    if (
      claims.purpose !== purpose ||
      claims.email !== owner ||
      !Number.isFinite(claims.issuedAt) ||
      !Number.isFinite(claims.expiresAt) ||
      claims.issuedAt > now + 5000 ||
      claims.expiresAt <= now ||
      claims.expiresAt - claims.issuedAt > maxLife ||
      claims.expiresAt <= claims.issuedAt
    )
      return null;
    return claims;
  } catch {
    return null;
  }
}
export function verifyOwnerProof(
  token: string,
  state: string,
  secret: string,
  now = Date.now(),
) {
  if (!/^[a-f0-9]{64}$/.test(state)) return null;
  const claims = verify(token, "live-owner-proof", secret, 60_000, now);
  return claims?.state === state ? claims : null;
}
export function createOwnerSession(secret: string, now = Date.now()) {
  return signClaims(
    {
      purpose: "live-owner-session",
      email: owner,
      issuedAt: now,
      expiresAt: now + 12 * 60 * 60 * 1000,
    },
    secret,
  );
}
export function verifyOwnerSession(
  token: string,
  secret: string,
  now = Date.now(),
) {
  return verify(token, "live-owner-session", secret, 12 * 60 * 60 * 1000, now);
}
