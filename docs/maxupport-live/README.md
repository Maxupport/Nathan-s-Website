# Maxupport LIVE｜規格與 Preview 索引

> 狀態：正式入口已上線，真實收件及本人管理可使用；Email 待 Google 新權限確認
> 分支：`feature/maxupport-live`
> 更新日期：2026-11-06

## 專案一句話

Maxupport LIVE 是生涯擺渡人 Max 的單人、單一場次序列街頭演出系統：觀眾可在 iPhone 上點歌、提問、訂閱、聯絡或鼓勵；Max 可在 MacBook 管理歌曲、排定演出、發布上一場歌單與下一場預告，並在點歌被排入演出時主動通知觀眾。

## 第一階段交付

- [產品需求](./REQUIREMENTS.md)
- [資料結構](./DATA_MODEL.md)
- [系統架構與技術決策](./ARCHITECTURE.md)
- [開發計畫](./DEVELOPMENT_PLAN.md)
- [驗收標準](./ACCEPTANCE_CRITERIA.md)
- [品牌與易拉展轉譯](./BRAND_GUIDE.md)
- [待第二階段設定的項目](./OPEN_ITEMS.md)
- [第二階段 Demo 操作與驗證](./PREVIEW.md)
- [Google Sheet 即時收件方案與啟用進度](./SHEETS_SYNC.md)
- [管理操作手冊](./OPERATOR_GUIDE.md)
- [上線與驗證紀錄](./RELEASE.md)

## 歌曲資料來源

- YouTube 頻道：<https://www.youtube.com/@OLDSONGSCOVEREDstartFrom1980>
- Google Sheet：已建立於 Max 的 Google Drive；連結不寫入公開儲存庫，由專案擁有者另行保存。
- 已匯入 287 支影片；標題含 `kala`（不分大小寫）的 114 支影片已獨立標示並保留網址。
- 影片解析後彙整為 159 筆歌曲候選。自動解析結果一律標示為待核對，不視為人工確認的歌曲或演唱者資料。
- 主分類先建立選項、歌曲分類欄保持空白，由 Max 人工分類；次標籤可複選。

## 範圍界線

`/live` 與 `/live/admin` 已接上真實私人 Sheet、本人 Google 登入、保存、分類、歌單與手動場次切換。未設定服務的本機仍可使用獨立 Demo。Email 程式及佇列已通過測試，但 Google 新寄信權限尚待確認；訂閱由現有 Google 表單完成最後一步。正式入口採明確開關部署，main 分支及既有網站頁面程式不變。
