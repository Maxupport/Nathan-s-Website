# Maxupport LIVE｜規格與 Preview 索引

> 狀態：第二階段互動 Demo（尚未正式上線）
> 分支：`feature/maxupport-live`
> 更新日期：2026-11-05

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

## 歌曲資料來源

- YouTube 頻道：<https://www.youtube.com/@OLDSONGSCOVEREDstartFrom1980>
- Google Sheet：已建立於 Max 的 Google Drive；連結不寫入公開儲存庫，由專案擁有者另行保存。
- 已匯入 287 支影片；標題含 `kala`（不分大小寫）的 114 支影片已獨立標示並保留網址。
- 影片解析後彙整為 159 筆歌曲候選。自動解析結果一律標示為待核對，不視為人工確認的歌曲或演唱者資料。
- 主分類先建立選項、歌曲分類欄保持空白，由 Max 人工分類；次標籤可複選。

## 範圍界線

第一階段規格已完成，使用者已授權開始第二階段網頁開發。目前新增 `/live` 與 `/live/admin` 的獨立 Demo，資料只放在目前分頁的記憶體；未串接正式資料庫、Google 登入、訂閱或通知服務。既有首頁、服務頁、部落格與選單不變；正式網域上線仍待確認。`la-cozzi-website/` 是既有重複子專案，本功能不在其中實作。
