# Google Sheet 即時收件方案

## 已確認的方向

觀眾在網站填表，由 Next.js 後端把正式提交直接寫入私人 Google Sheet。互動資料以 Sheet 為第一版主資料來源，不另外維護資料庫副本。依使用者最新決定，歌曲、分類與觀眾互動集中在同一份既有試算表，以不同分頁管理；檔案必須維持私人，未來分享歌單時只透過網站的公開資料投影。

「即時」定義為提交時同步等待寫入回執，而非事後批次匯出。只有 Google 確認保存才可顯示成功；失敗保留表單，以相同提交 ID 重試。後續管理端取得 Google 登入授權後，可每 5 秒更新可見分頁，並提供立即重新整理；這是近即時輪詢，不宣稱零延遲推播。

## 本次程式進度

- 已新增 `POST /api/live/submissions`：伺服器驗證、同源檢查、16KB 上限、伺服器簽章、等待寫入回執。
- 已提供 `scripts/maxupport-live/Code.gs`：Google Apps Script 收件橋接器，簽章驗證、過期限制、鎖定防並行重複寫入、固定提交 ID 重試防重複、試算表公式跳脫與全域每分鐘 60 筆的保守防護。
- 已提供本機驗證測試；Google 實際部署、真實寫入與端到端驗收尚未執行。
- API 預設關閉，且 Production 一律拒絕。目前 Preview 表單仍是原有記憶體 Demo，尚未接上此 API。不可只設定後端就宣稱前端已同步。
- 公開 API 只有寫入，沒有讀取觀眾個資的 GET。管理端 Google 登入、私有讀取、5 秒更新、處理／刪除／匿名化同步與點歌彙總是下個垂直切片，尚未完成。

## 紀錄範圍

提交 ID、保存時間、互動類型、主題、暱稱、Email、Instagram、歌曲與演唱者、正式提交內容、回覆同意版本、獨立訂閱同意、互動事件、處理狀態、通知狀態。

事件僅允許表單開啟、接受回覆同意、進入填寫頁與提交；此切片把事件隨正式提交一起保存，不包含未提交訪客的獨立瀏覽追蹤。前端事件採集尚待接上。不保存逐字輸入、IP、裝置指紋或任意附加欄位。瀏覽器時間只作互動參考，正式保存時間由 Google 端產生。

## Google 端啟用前置

1. 已於使用者指定的既有歌庫新增 `互動總覽` 與 `互動原始紀錄` 分頁；使用此檔案的 ID，不另建正式收件檔。原始紀錄首列依序為下列 15 欄，不放測試個資：

   `提交 ID｜保存時間｜類型｜主題｜暱稱｜Email｜Instagram｜歌曲｜演唱者｜內容｜回覆同意版本｜訂閱同意｜互動事件｜處理狀態｜通知狀態`

2. 建立綁定於該檔案的 Apps Script，貼入 `Code.gs`；在 Script Properties 設定 `LIVE_SPREADSHEET_ID` 與至少 32 字元的隨機 `LIVE_BRIDGE_SECRET`。不要將密鑰貼在聊天、Git 或試算表儲存格。
3. Max 在 Google 部署流程中完成帳號授權。橋接器需以擁有者身分執行，對伺服器開放 Web App 呼叫；資料檔案維持私人。公開端點只有驗證簽章後才可寫入，沒有讀取功能。
4. Vercel 僅在此功能分支的 Preview 設定伺服器環境變數：`LIVE_SHEETS_BRIDGE_URL`（Google 提供的 `/exec` URL）、`LIVE_SHEETS_BRIDGE_SECRET`、`LIVE_SHEETS_INTAKE_ENABLED=true`。均不可使用 `NEXT_PUBLIC_`。
5. 先以隔離測試表驗證一次寫入、超時後重試不重複、錯誤簽章拒絕、關閉功能旗標拒絕。之後才接上網站表單與 Google 登入管理端；正式資料與正式部署另行驗收。

目前 Google 授權、橋接器部署與環境設定均未完成，沒有對既有 Google Sheet 寫入任何觀眾資料。新增分頁只有空白收件欄位與零筆統計，並非已啟用的收件服務。先前另建的待啟用空表不再作為串接目標。

## 後續一致性要求

- 對應一筆原始提交一個穩定 ID；同歌曲不同觀眾仍各存一筆，統計時合併。
- 不在每位觀眾載入公開頁時讀取整張私人表；公開歌單另做可公開資料投影。
- Sheets 的手動修改不會自動觸發網站更新，須透過受保護輪詢讀回。API 更新不可覆蓋不相關欄位。
- 刪除與匿名化要涵蓋原始記錄及衍生彙總，不能留下另一份含個資的事件副本。
- 既有文章／小說訂閱仍走原系統；保存訂閱意願不等於已建立訂閱。

測試：

```sh
node --experimental-strip-types --test src/lib/live/intake.test.mjs scripts/maxupport-live/bridge.test.mjs
```

官方參考：[Apps Script Web Apps](https://developers.google.com/apps-script/guides/web)、[LockService](https://developers.google.com/apps-script/reference/lock/lock-service)。
