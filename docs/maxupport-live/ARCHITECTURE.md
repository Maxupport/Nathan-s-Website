# 系統架構與技術決策

## 1. 現有專案盤點

- 框架：Next.js 16.2.1、React 19.2.4、TypeScript、Tailwind CSS 4。
- 目前沒有可直接沿用的資料庫、管理端登入或 Maxupport LIVE API。
- 既有網站已在 Vercel，正式環境連到 `main`；功能分支只建立 Preview，不可提升為 Production。
- 根目錄與 `la-cozzi-website/` 內有重複專案。新功能只在根目錄實作。
- 現有 lint 有 48 個 errors、9 個 warnings；套件稽核有既存風險。這些是基線技術債，必須另開工作處理，不能混入本功能 PR。
- 沙箱建置因無法下載 Google Font 而失敗；不是本階段新增程式造成的編譯錯誤。

## 2. 建議邏輯架構

```text
iPhone 觀眾
  -> /live（公開頁）
  -> Server Actions / Route Handlers（驗證、速率限制、提交）
  -> 關聯式資料庫（互動、歌曲、場次、歌單、同意、通知紀錄）

MacBook Max
  -> /live/admin（Google 登入 + 帳號白名單）
  -> 收件匣／歌庫／歌單生成／發布／場次切換／匯出

通知工作
  -> Email 提醒 Max
  -> Email 通知點歌者
  -> Instagram 待辦（無可靠自動介面時由 Max 手動完成）
```

## 3. 免費優先策略

更新決策：第一版互動收件改以私人 Google Sheet 作為主資料來源，透過 Next.js 寫入 API 與簽章 Apps Script 橋接；尚未啟用。以下 PostgreSQL 選項保留作為未來資料量或並行需求提高時的替代，詳細實作與授權前置見 [SHEETS_SYNC.md](./SHEETS_SYNC.md)。

第二階段先用以下順序做決策，且在使用者確認前不建立任何外部服務：

1. **本機開發**：本機環境與測試資料完全免費，所有 schema／migration 可重建。
2. **Vercel Preview**：沿用既有專案的功能分支 Preview；僅 Max 登入查看管理端 Demo。
3. **正式資料層**：選擇可從 Vercel 安全連線、具免費額度的託管 PostgreSQL；在採用前再次核對當時額度、休眠、備份與超額計費規則。
4. **Email**：先選有免費額度且支援交易郵件的服務；若尚未配置，Preview 顯示可稽核的模擬寄送狀態，不宣稱已送達。
5. 不因追求免費而把個資放進 Git、公開 JSON、瀏覽器 localStorage 或公開 Google Sheet。

## 4. 路由邊界

預計新增：

- `/live`：公開頁。
- `/live/thanks`：提交完成與下一步。
- `/live/admin/*`：受保護管理端。
- `/api/live/*` 或對應 Server Actions：只處理 Maxupport LIVE。

既有首頁、服務頁、部落格、Notion 內容流程及既有訂閱 API 不改動；訂閱分支只透過明確介面呼叫既有流程。

## 5. 安全與隱私

- 管理端同時要求 Google 身分驗證與指定 Email 白名單，不能只靠「知道網址」。
- 所有管理查詢與修改都在伺服器再次授權。
- 表單採 allowlist schema、長度限制、蜜罐、IP／指紋節流與一致的錯誤回應。
- Email、IG、同意及訊息內容不得進入前端分析事件或應用程式一般 log。
- CSV 匯出屬敏感操作，需伺服器授權並留下稽核事件。
- 單筆刪除與批次匿名化需二次確認；匿名化後不可透過一般管理 UI 還原個資。

## 6. PWA／現場穩定性

- 公開頁以弱網路與 iPhone Safari 測試，優先小體積、清楚狀態與可重試提交。
- 不快取含個資的回應，也不在離線佇列保存互動內容。
- 下一場預告可快取公開唯讀資料；發布或切換場次後主動 revalidate。
- 表單提交使用 idempotency key，避免現場網路重送造成重複資料；相同歌曲統計合併仍由後端處理。

## 7. Next.js 16 實作約束

- 預設使用 Server Components；只有表單互動、拖曳排序等必要區塊使用 Client Components。
- Route Handlers／Server Actions 必須在資料讀寫前做驗證與授權。
- 環境變數僅伺服器端使用，除非明確屬公開設定，否則不得以 `NEXT_PUBLIC_` 暴露。
- 實作前依 `AGENTS.md` 重新查閱安裝版本的 Next.js 文件，避免套用舊版 API。
