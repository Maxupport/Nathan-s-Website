# Google Sheet 即時收件方案

## 已確認的方向

觀眾在網站填表，由 Next.js 後端把正式提交直接寫入私人 Google Sheet。互動資料以 Sheet 為第一版主資料來源，不另外維護資料庫副本。依使用者最新決定，歌曲、分類與觀眾互動集中在同一份既有試算表，以不同分頁管理；檔案必須維持私人，未來分享歌單時只透過網站的公開資料投影。

「即時」定義為提交時同步等待寫入回執，而非事後批次匯出。只有 Google 確認保存才可顯示成功；失敗保留表單，以相同提交 ID 重試。後續管理端取得 Google 登入授權後，可每 5 秒更新可見分頁，並提供立即重新整理；這是近即時輪詢，不宣稱零延遲推播。

## 本次程式進度

- 已新增 `POST /api/live/submissions`：伺服器驗證、同源檢查、16KB 上限、伺服器簽章、等待寫入回執。
- 已提供 `scripts/maxupport-live/Code.gs`：Google Apps Script 收件橋接器，簽章驗證、過期限制、鎖定防並行重複寫入、固定提交 ID 重試防重複、試算表公式跳脫與全域每分鐘 60 筆的保守防護。
- 已部署 Google 收件橋接器，並以明確標示的系統測試資料驗證真實寫入、同 ID 重試防重複、錯誤簽章拒絕。
- 表單已接上 API：等待保存回執才顯示成功；送出期間避免雙擊，失敗保留原始提交，以相同 ID 與內容重試。此切片不將正式資料複製到未登入的 Demo 管理端。
- API 預設關閉。Preview 已設定收件與登入；Production 另需 `LIVE_RELEASE_ENABLED=true` 才開放。正式部署使用功能分支提交，不推送 main，既有頁面程式不變。
- 已完成本機瀏覽器 → Next.js API → Google Sheet → 成功畫面驗證；測試主題與四個操作事件確實保存。線上 Preview 的部署後驗證另記於交付紀錄。
- 已完成本人 Google 登入、私人管理 API、每 5 秒更新可見管理頁、手動重新載入及儲存修改。歌庫只更新改動歌曲的前八欄，不覆蓋 Kala 連結、來源與備註；場次存於同一檔案的 `LIVE 演出資料` 分頁。
- 處理狀態、指定 ID 的刪除／匿名化已接上 Sheet；瀏覽器實測草稿保存、重新讀回及一筆系統測試留言的狀態保存。整份檔案保持私人。
- 公開 `/api/live/shows` 只回傳已發布場次的明確欄位；不提供原始留言、聯絡資料、未發布草稿或私人試算表位置。公開頁每 15 秒更新演出資訊。

## 紀錄範圍

2026-11-06 更新：點歌與提問需 Email；送出前告知 `live-updates-default-v1` 預設接收，送出後詢問意願，只有明確回答願意才記 `live-updates-v1`。新增同檔案 `LIVE 演出訂閱` 分頁：訂閱 ID、Email、狀態、告知／同意版本、建立時間、更新時間、最近提交 ID。此分頁與文章／小說訂閱意願分開，不回填舊聯絡人。發布場次時以訂閱 ID＋場次 ID 去重廣播；佇列只存 ID。退訂連結使用分隔用途的 HMAC，不把 Email 放在網址，GET 只顯示確認、POST 才取消；匿名化／刪除互動時也移除對應演出訂閱的 Email。保留已取消狀態以防止不當重寄。

提交 ID、保存時間、互動類型、主題、暱稱、Email、Instagram、歌曲與演唱者、正式提交內容、回覆同意版本、獨立訂閱同意、互動事件、處理狀態、通知狀態。

事件僅允許表單開啟、接受回覆同意、進入填寫頁與提交；此切片把事件隨正式提交一起保存，不包含未提交訪客的獨立瀏覽追蹤。前端已採集上述四個事件，不保存逐字輸入、IP、裝置指紋或任意附加欄位。瀏覽器時間只作互動參考，正式保存時間由 Google 端產生。

## Google 端啟用前置

1. 已於使用者指定的既有歌庫新增 `互動總覽` 與 `互動原始紀錄` 分頁；使用此檔案的 ID，不另建正式收件檔。原始紀錄首列依序為下列 15 欄，不放測試個資：

   `提交 ID｜保存時間｜類型｜主題｜暱稱｜Email｜Instagram｜歌曲｜演唱者｜內容｜回覆同意版本｜訂閱同意｜互動事件｜處理狀態｜通知狀態`

2. 建立綁定於該檔案的 Apps Script，貼入 `Code.gs`；在 Script Properties 設定 `LIVE_SPREADSHEET_ID` 與至少 32 字元的隨機 `LIVE_BRIDGE_SECRET`。不要將密鑰貼在聊天、Git 或試算表儲存格。
3. 橋接器以擁有者身分執行，對伺服器開放 Web App 呼叫；資料檔案維持私人。所有資料操作均需伺服器簽章。管理端另外驗證本人 Google 帳號，不能以擁有者的執行身分取代訪客身分。
4. Vercel 僅在此功能分支的 Preview 設定伺服器環境變數：`LIVE_SHEETS_BRIDGE_URL`（Google 提供的 `/exec` URL）、`LIVE_SHEETS_BRIDGE_SECRET`、`LIVE_SHEETS_INTAKE_ENABLED=true`。均不可使用 `NEXT_PUBLIC_`。
5. 先以隔離測試表驗證一次寫入、超時後重試不重複、錯誤簽章拒絕、關閉功能旗標拒絕。之後才接上網站表單與 Google 登入管理端；正式資料與正式部署另行驗收。
6. 管理端需 `LIVE_ADMIN_AUTH_ENABLED=true`。登入回傳位置採固定允許清單，Google `Session.getActiveUser().getEmail()` 必須是 Max 本人；無法辨識或其他帳號一律拒絕。60 秒簽章回執經 HttpOnly 隨機 state cookie 驗證後，換成 12 小時 HttpOnly、SameSite=Lax、HTTPS Secure 工作階段。`getEffectiveUser()` 不可用於授權。

目前 Google 橋接器、真實收件與本人登入均已驗證，並已設定正式入口的明確開關。原始紀錄有清楚標示的系統測試，尚無真實觀眾留言；先前另建空表不作為串接目標。密鑰、私人檔案 ID 及端點僅存於擁有者設定／伺服器環境，不提交公開儲存庫。

## 後續一致性要求

- 對應一筆原始提交一個穩定 ID；同歌曲不同觀眾仍各存一筆，統計時合併。
- 不在每位觀眾載入公開頁時讀取整張私人表；公開歌單另做可公開資料投影。
- Sheets 的手動修改不會自動觸發網站更新，須透過受保護輪詢讀回。API 更新不可覆蓋不相關欄位。
- 歌庫與場次修改帶入版本雜湊；若 Sheet 另有手動修改則回傳 409，要求重新載入。新增觀眾提交不會令歌庫版本失效，也不會被管理端批次覆蓋。
- Sheet 多個範圍寫入並非資料庫交易；若 Google 寫入中途失敗，畫面不宣稱完整成功，須重新載入檢查實際保存範圍。
- 刪除與匿名化要涵蓋原始記錄及衍生彙總，不能留下另一份含個資的事件副本。
- 既有文章／小說訂閱仍走原系統；保存訂閱意願不等於已建立訂閱。

測試：

```sh
node --experimental-strip-types --test src/lib/live/intake.test.mjs src/lib/live/submit.test.mjs scripts/maxupport-live/bridge.test.mjs
```

官方參考：[Apps Script Web Apps](https://developers.google.com/apps-script/guides/web)、[LockService](https://developers.google.com/apps-script/reference/lock/lock-service)。

登入依據：[Session 的 active user 與 effective user 差異](https://developers.google.com/apps-script/reference/base/session)。此版本為單一擁有者驗證。Preview 保留 Vercel 保護，正式自訂網域對觀眾公開，私人 API 始終需本人登入。

## 通知服務

`MailBridge.gs` 部署於獨立 Google 專案，只需 MailApp 寄信權限，不讀取 Gmail 收件匣。使用者已具體同意新增寄信權限，Google 部署完成；本人 Gmail 收件匣已確認收到系統測試信，重試回傳 duplicate=true 而不重寄。

已設定伺服器 `LIVE_EMAIL_BRIDGE_URL`，資料橋接器指令碼屬性 `LIVE_NOTIFICATIONS_ENABLED=true`，並重新部署 Production 使設定生效。佇列在同檔案 `LIVE 通知佇列`，只記 ID 與狀態；原始留言及 Email 不複製進佇列。Next.js `after` 在回應後處理寄送，可見管理頁有待寄通知時也會處理。

正式端到端驗證使用經原生 Google Sheet 工具核對的既有系統測試 ID：網站回應 201 duplicate=true、未新增原始留言，通知佇列完成待寄送→處理中→已寄送，且本人 Gmail 確認收到對應提交 ID 的提醒。未寄給任何觀眾或測試 IG 帳號。

新提交提醒 Max；發布歌單時通知有 Email 的點歌者，沒有 Email 則建立 IG 人工狀態。寄送不明不自動重寄，額度不足保留至至少 24 小時後再嘗試。沒有事件且管理頁未開啟時不保證背景排程會執行，管理者可按「處理待寄通知」。刪除／匿名化會取消相關尚未完成通知。

官方依據：[MailApp 的權限與剩餘額度](https://developers.google.com/apps-script/reference/mail/mail-app)。
