# 系統架構與技術決策

## 現有網站邊界

根目錄使用 Next.js 16.2.1、React 19.2.4、TypeScript 與 Tailwind CSS 4，沿用既有 Vercel 專案。LIVE 的頁面、元件、API 與 CSS 均獨立；既有首頁、服務、部落格、Notion 流程及選單程式不改動。重複子目錄 `la-cozzi-website/` 不參與實作。

工作留在 `feature/maxupport-live` 與 Draft PR，不推送或合併 main。正式部署可由指定功能分支提交建立；`LIVE_RELEASE_ENABLED=true` 是 Production 的明確開關，未設定時 LIVE 不開放。後續 main 部署仍會使用 main 的程式，合併前需留意覆蓋；Sheet 資料不隨網站版本刪除。

## 資料流

```text
iPhone -> /live -> POST /api/live/submissions
  -> 同源／內容驗證 -> HMAC 簽章 Apps Script
  -> 私人 Google Sheet 保存及防重複回執 -> 成功畫面

MacBook -> /live/admin -> Google active user 本人驗證
  -> state 綁定短效回執 -> HttpOnly 工作階段
  -> 私人 API -> 同一份 Sheet 的歌曲、場次及原始互動

公開演出 -> /api/live/shows -> 已發布場次的明確欄位投影
通知佇列 -> 獨立 MailApp 寄信服務（待 Google 新權限確認）
訂閱意願 -> 獨立同意 -> 既有 Google 表單完成最後一步
```

## 第一版主資料來源

歌曲、分類、影片來源、原始互動、彙總與場次集中在同一份私人 Google Sheet。網站不另建資料庫，也不公開整張表。PostgreSQL 僅為未來資料量或並行需求提高時的替代方案。

- 歌曲編輯只更新目標列 A:H，不覆蓋 Kala、來源及備註；M 欄為同歌點歌次數的衍生統計。
- 原始提交以 UUID 識別，鎖定後防並行重複；同 ID 重試回傳原保存時間。
- 已發布歌單保存歌曲快照；本場、下一場、上一場由 Max 手動切換。
- 歌庫與場次使用版本雜湊，手動改 Sheet 後舊版本不能覆蓋。原始互動依指定 ID 修改，不整表取代。
- 管理頁可見時每 5 秒輪詢；公開頁每 15 秒更新，公開回應另有短期 CDN 快取，屬近即時更新。
- 多個 Sheet 範圍不是資料庫交易；寫入中途失敗須重新載入檢查，不宣稱全部成功。

## 身分與隱私

只接受 `Session.getActiveUser()` 的本人帳號，不能用 `getEffectiveUser()` 代替訪客身分。回傳位置採固定允許清單，60 秒證明須符合 HttpOnly 隨機 state cookie，再換成 12 小時 HttpOnly、SameSite=Lax、HTTPS Secure 工作階段。私人 API 每次重新驗證，登出與過期後清除管理資料。

公開 API 不回傳私人檔案 ID、原始留言、聯絡方式或未發布草稿。密鑰僅存於伺服器／Google 指令碼屬性，不使用 `NEXT_PUBLIC_`。個資不進一般 log、Git 或 localStorage。

表單只保存正式提交及四種操作事件，不追蹤 IP、指紋、逐字輸入或未提交草稿。單次回覆與訂閱同意分開；超時保留原嘗試，明確輸入拒絕則允許修改。CSV 對公式前綴跳脫。

## 通知與訂閱

通知佇列只存提交／場次 ID 及狀態，不複製聯絡資料或原始留言。新提交提醒 Max；歌曲發布時依歌名與歌手合併比對，再通知有 Email 的點歌者。IG 留作人工待辦。

寄信專案只使用 MailApp，不能讀取 Gmail 收件匣；採分離衍生密鑰與簽章。結果不明時標示需人工確認，不盲目重寄；額度不足保留狀態。授權未完成前不設定寄信端點、不宣稱已寄送。

訂閱成功頁連到現有 Google 表單；LIVE 保存意願與偏好不等於完成原表單或啟用文章／小說分眾，不複製既有網站以固定延遲宣稱成功的行為。

## 驗證與技術債

執行 Node 原生測試、TypeScript、LIVE 範圍 ESLint、完整建置及瀏覽器端到端驗證。實際 iPhone Safari 與真實寄信仍需分別驗收。

既有全站 lint 的 48 errors／9 warnings 與套件稽核問題屬基線技術債，依使用者決定拆開處理。實作遵循 `AGENTS.md` 及已安裝 Next.js 16 文件。
