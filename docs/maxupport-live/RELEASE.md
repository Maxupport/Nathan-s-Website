# 上線與驗證紀錄

2026-11-06：已從功能分支提交 `eccbcecf79e678810d523cd13ba7048280374354` 建立 Production，Vercel 狀態 READY，正式別名包含 `www.maxupport.space` 與 `maxupport.space`。Google 資料橋接器獨立更新至第 6 版，唯讀查詢不占用寫入鎖。

- 公開入口：<https://www.maxupport.space/live>
- 私人後台：<https://www.maxupport.space/live/admin>
- 原首頁回應 200，未新增 LIVE 選單；main 仍為既有提交，沒有推送或合併。
- 正式表單使用原有系統測試 ID 驗證，回應 201、duplicate=true、保存時間與原始紀錄一致，未新增重複留言。
- 正式 Google 本人登入及 Sheet 讀回完成，後台顯示真實 159 首歌曲、兩份草稿及測試互動；匿名私人 API 回應 401。
- 三個公開查詢與一筆原 ID 重送同時驗證，全部成功；僅為小量併發驗證。
- 36 項本機測試、TypeScript、LIVE 範圍 ESLint 與完整建置通過。
- 手機模擬尺寸 320×568／844×390 的六入口順序、顯示與水平溢出檢查通過，實際 iPhone Safari 尚待實機驗收。

## 通知驗證與待提供資料

Google 寄信權限已由使用者具體同意，寄信服務與正式環境設定已啟用。最新 Production 網站使用功能分支提交 `6563d7332f73abe4b98f3a1c2bf90634f4d0016f`，Vercel 為 READY，沒有推送 main。

本人 Gmail 已確認收到系統測試信；同一通知編號重試回傳 duplicate=true。另以原生工具先核對既有系統測試紀錄，再由正式網站重送同 ID，取得原保存回執、不新增留言；自動通知佇列記為已寄送，Gmail 確認收到含該提交 ID 的提醒。這兩封驗證信均只寄給 Max，沒有對觀眾寄送測試。

訂閱成功頁提供既有 Google 表單，由觀眾完成最後一步；不是後端自動建立文章／小說分眾。歌曲分類、首場日期／時間／地點仍由 Max 提供，原易拉展 QR 圖檔尚未替換。

## 維護

Draft PR 與功能分支保留，main 未合併。未來重新部署 main 會覆蓋這個功能分支的正式網站版本；Sheet 資料保留。回滾只處理網站部署，不刪除原始互動。Google 程式與網站需分別確認版本，私人檔案位置及密鑰不放入此紀錄。
