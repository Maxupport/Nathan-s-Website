import { cookies } from "next/headers";
import { verifyOwnerSession } from "./auth-core";
import { liveAvailable } from "./config";

export const sessionCookie = "maxupport_live_session";
export const stateCookie = "maxupport_live_login_state";
export function ownerAuthEnabled() {
  return (
    liveAvailable() &&
    process.env.LIVE_ADMIN_AUTH_ENABLED === "true" &&
    Boolean(process.env.LIVE_SHEETS_BRIDGE_SECRET)
  );
}
export async function isOwner() {
  if (!ownerAuthEnabled()) return false;
  const cookie = (await cookies()).get(sessionCookie)?.value;
  return Boolean(
    cookie &&
    verifyOwnerSession(cookie, process.env.LIVE_SHEETS_BRIDGE_SECRET ?? ""),
  );
}
