import LiveAdmin from "@/components/live/LiveAdmin";
import { isOwner, ownerAuthEnabled } from "@/lib/live/auth";
export default async function AdminPage() {
  if (ownerAuthEnabled() && !(await isOwner()))
    return (
      <main className="live-container live-section">
        <p className="live-eyebrow">MAXUPPORT LIVE / 私人管理工作室</p>
        <h1>歡迎回來，Max。</h1>
        <p>請使用你的 Google 帳號登入，才能讀取與管理觀眾資料。</p>
        <a className="live-button" href="/api/live/auth/login">
          以 Google 登入管理端
        </a>
      </main>
    );
  return <LiveAdmin />;
}
