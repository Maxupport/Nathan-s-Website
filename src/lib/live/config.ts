// Explicit opt-in release gate; preview/development remain independently testable.
export function liveAvailable(environment: NodeJS.ProcessEnv = process.env) {
  return (
    environment.VERCEL_ENV !== "production" ||
    environment.LIVE_RELEASE_ENABLED === "true"
  );
}
