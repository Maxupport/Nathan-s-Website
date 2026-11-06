# Maxupport LIVE 操作手冊

## 進入方式

程式保留在獨立分支及 Draft PR；正式入口由功能分支提交部署，既有首頁、服務及部落格程式不改動。

- 觀眾頁：<https://www.maxupport.space/live>。
- 私人後台：<https://www.maxupport.space/live/admin>。
- `maxupport.space/live` 會轉到 www 網址；原網站選單沒有新增 LIVE 入口，可直接開啟或掃 QR。
- 登入時使用 Max 的 Google 帳號；Google 確認本人後，點「返回管理端」。工作階段有效 12 小時，可隨時登出。
- 手機初次登入會先開啟 Google 帳號選擇，請選 `maxupport@gmail.com`。若無法確認帳號，橋接頁提供「登入／切換 Google 帳號」及返回入口，不會停在只有提示文字的頁面。登入超過五分鐘請重新開始；本次修正仍待使用者在實際 iPhone 確認。
- Google Sheet 直接作為資料來源；使用你原本持有的私人檔案連結，不需公開分享。

## 歌曲與演出

歌曲主分類保留為空白，等你自行分類；可在原本的 Google Sheet 填寫，或在後台選擇主分類與三個標籤。後台修改後按「儲存修改」。既有 Kala 網址、來源與備註不會被這些編輯覆蓋。

首批已建立兩份草稿。因歌曲尚未分類，抽選會列出缺少的配置，不會把未分類歌曲假設為台文、英文、中國歌或老歌。完成分類後按「重新抽選」，可選老歌五首或指定歌手五首，並拖曳／上下移動及替換歌曲。

1. 填寫日期、時間、地點、文案，確認完整歌單。
2. 按「發布下一場預告」。有警告時需再次確認；再按「儲存修改」，其他觀眾才會看到。
3. 演出開始時按「開始本場演出」並儲存。本場完整歌單顯示在上一場／下一場上方，可同時準備與發布下一場。
4. 演出完成時手動確認結束並儲存，此場移入上一場。系統不會依日期自動開始或結束。

## 觀眾互動

表單送出時等待 Google 保存回執，成功後才顯示感謝畫面。失敗會保留內容，按「重試保存」以相同提交 ID 重試；不要重新整理。

後台在可見時每 5 秒讀回資料，可手動重新載入。編輯中保留未儲存內容並持續加入新留言；如果 Sheet 已有其他修改，儲存時會提醒重新載入，避免覆蓋。

處理狀態、匿名化、刪除均由管理者手動操作，再按「儲存修改」。匿名化會清除暱稱、Email、IG 與留言內容，保留歌曲與統計；刪除則移除指定提交。CSV 匯出只在登入後提供。

## 通知狀態與待提供資料

- Email 自動收件提醒與排入演出通知已啟用。`LIVE 通知佇列` 可查看寄送狀態；需人工確認或額度不足不等於已寄出。IG 仍由 Max 手動聯繫。
- 訂閱成功頁可前往既有 Google 表單完成最後一步；保存意願不等於已建立訂閱或啟用文章／小說分眾。
- 易拉展圖檔尚未更換 QR，實際 iPhone Safari 仍待實機驗收。
- 原始紀錄中有標示清楚的系統測試資料，可在管理端自行刪除；沒有真實觀眾資料。

## 開發驗證

```sh
node --experimental-strip-types --test src/lib/live/*.test.mjs scripts/maxupport-live/*.test.mjs
npx tsc --noEmit
npx eslint src/components/live src/lib/live src/app/live src/app/api/live
npm run build
```

既有網站範圍的 lint 與相依套件問題仍拆開處理，不混入 LIVE 變更。`allowImportingTsExtensions` 僅讓無編譯輸出的 TypeScript 檢查與 Node 原生測試共用模組，不改變網站執行方式。

Production 需設定 `LIVE_RELEASE_ENABLED=true` 才開放 LIVE；Preview 保留存取保護。main 尚未合併本 PR，後續重新部署 main 會覆蓋功能分支的正式版本；Sheet 資料不受影響。
