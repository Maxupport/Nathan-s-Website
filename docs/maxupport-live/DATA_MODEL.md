# 資料結構

## 1. 設計原則

- 原始互動與彙總統計分離：重複點歌可以合併計數，但不可覆蓋原始提交。
- 公開資料與個資分離：公開歌單不暴露 Email、Instagram、同意紀錄或管理備註。
- 發布內容使用快照：歌曲日後改名或重新分類，不應改寫已發布的歷史歌單。
- 永久保留是產品政策，不代表不可治理：管理員仍可單筆刪除或批次匿名化，且兩者留下稽核事件。

## 2. 核心實體

### `songs`

| 欄位 | 型別 | 規則 |
|---|---|---|
| `id` | UUID | 主鍵 |
| `title` | text | 必填 |
| `artist` | text | 點歌建立時必填；匯入資料可暫待核對 |
| `main_category` | enum/null | 台文／華文／英文／中國歌／老歌／其他 |
| `is_serious` | boolean | 預設 false |
| `is_showcase` | boolean | 預設 false，對應炫技 |
| `is_opener_closer` | boolean | 預設 false |
| `is_stage_ready` | boolean | 預設 true |
| `data_status` | enum | `pending_review`／`verified`／`needs_fix` |
| `request_count` | integer | 可重建的快取統計，預設 0 |
| `created_at` / `updated_at` | timestamptz | 台北顯示、UTC 保存 |

### `song_videos`

| 欄位 | 型別 | 規則 |
|---|---|---|
| `id` | UUID | 主鍵 |
| `song_id` | UUID/null | 可在人工核對前為空 |
| `youtube_id` | text | 唯一 |
| `raw_title` | text | 保留原始標題 |
| `url` | text | 必填 |
| `is_kala` | boolean | 標題含 kala（不分大小寫） |
| `parsed_title` / `parsed_artist` | text/null | 自動解析結果 |
| `review_status` | enum | 預設 `pending_review` |

### `submissions`

所有互動共用的信封資料。

| 欄位 | 型別 | 規則 |
|---|---|---|
| `id` | UUID | 主鍵 |
| `type` | enum | `song_request`／`question`／`subscription`／`contact`／`encouragement` |
| `nickname` | text/null | 選填 |
| `email` | text/null | Email、IG 至少一種才可接收回覆 |
| `instagram_handle` | text/null | 正規化保存，保留原始輸入供稽核 |
| `reply_consent_at` | timestamptz | 必填；未同意不得建立提交 |
| `reply_channel` | enum/null | `email`／`instagram` |
| `status` | enum | `new`／`in_progress`／`closed`／`deleted`／`anonymized` |
| `created_at` | timestamptz | 必填 |

各分支內容放在對應明細表，避免大量無關空欄：`song_requests`、`questions`、`subscription_links`、`contact_messages`、`encouragements`。

### `song_requests`

| 欄位 | 型別 | 規則 |
|---|---|---|
| `submission_id` | UUID | 對應 `submissions` |
| `song_id` | UUID/null | 可於人工合併前為空 |
| `requested_title` | text | 必填，保存觀眾原文 |
| `requested_artist` | text | 必填，保存觀眾原文 |
| `message` | text/null | 選填 |
| `scheduled_show_id` | UUID/null | 排入演出後設定 |
| `scheduled_at` | timestamptz/null | 排入時間 |
| `requester_notified_at` | timestamptz/null | 通知成功後設定 |

### `shows`

| 欄位 | 型別 | 規則 |
|---|---|---|
| `id` | UUID | 主鍵 |
| `sequence_no` | integer | 單一序列且唯一 |
| `status` | enum | `draft`／`published_next`／`performed_previous`／`archived` |
| `starts_at` | timestamptz/null | 預告可先存草稿 |
| `location` | text/null | 發布前必填 |
| `preview_copy` | text/null | 其他預告文案 |
| `generation_mode` | enum | `oldies_theme`／`featured_artist`／`manual` |
| `featured_artist` | text/null | 指定歌手模式必填 |
| `rule_warnings` | json | 發布時保留警告快照 |
| `published_at` / `performed_at` | timestamptz/null | 生命週期時間 |

### `show_setlist_items`

| 欄位 | 型別 | 規則 |
|---|---|---|
| `id` | UUID | 主鍵 |
| `show_id` | UUID | 外鍵 |
| `song_id` | UUID/null | 歌曲刪除後仍可留快照 |
| `position` | integer | 每場唯一，供拖曳排序 |
| `title_snapshot` | text | 發布前必填 |
| `artist_snapshot` | text | 發布前必填 |
| `slot_type` | enum | 台文／英文／中國歌／專題／機動 |
| `source_request_id` | UUID/null | 若來自點歌則連回原始提交 |

### `consents` 與 `notification_deliveries`

- `consents` 分別保存 `reply` 與 `subscription_marketing`，含版本、文案摘要、時間與來源。
- `notification_deliveries` 保存收件人、管道、範本、狀態、外部訊息 ID、錯誤及重試次數。
- Instagram 在沒有合法且穩定的自動私訊介面前，可先建立管理待辦並由 Max 手動發送，再記錄完成狀態；不可假裝已自動送達。

### `admin_audit_events`

記錄發布、警告後強制發布、場次切換、刪除、匿名化、CSV 匯出及通知狀態覆寫。禁止保存登入權杖、完整密碼或不必要的敏感內容。

## 3. 歌單規則檢查輸出

生成器不只回傳歌曲陣列，也回傳：

```ts
type GenerationResult = {
  items: SetlistItem[];
  warnings: Array<{
    code: string;
    message: string;
    affectedSongIds: string[];
    blocking: false;
  }>;
  shortages: Array<{
    slotType: string;
    required: number;
    available: number;
  }>;
};
```

規則不足不自動替代；所有警告皆可由唯一管理員確認後發布，但確認動作必須寫入稽核紀錄。

## 4. Google Sheet 與正式資料庫的關係

- Google Sheet 是歌曲盤點、人工分類與匯入準備工具，不是公開頁的執行期資料庫。
- 第二階段匯入前需保留 `歌曲 ID`，以更新／合併方式同步，避免每次建立重複歌曲。
- `全部影片` 保留一支影片一列；`歌曲主資料` 保留一首歌一列，因此筆數不同是預期行為。
