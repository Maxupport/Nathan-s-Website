import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LiveProvider from "@/components/live/LiveProvider";
import "./live.css";

export const metadata: Metadata = {
  title: "Maxupport LIVE｜把想聽的歌，留在這裡",
  description: "街頭唱歌，也陪你整理想法。點歌、提問，或留一句話給 Max。",
  robots: { index: false, follow: false },
};
export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Release gate: keep LIVE isolated until production acceptance is complete.
  if (process.env.VERCEL_ENV === "production") notFound();
  return (
    <div className="max-live">
      <LiveProvider
        managed={process.env.LIVE_ADMIN_AUTH_ENABLED === "true"}
        intakeEnabled={
          process.env.LIVE_SHEETS_INTAKE_ENABLED === "true" &&
          Boolean(
            process.env.LIVE_SHEETS_BRIDGE_URL &&
            process.env.LIVE_SHEETS_BRIDGE_SECRET,
          )
        }
      >
        {children}
      </LiveProvider>
    </div>
  );
}
