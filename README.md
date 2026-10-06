# 植物診療室網站

網址：https://laijianren.github.io

## 資料放在哪裡

| 想新增的內容 | 放在哪個資料夾 | 範本 |
|---|---|---|
| 診斷案件 | `_cases` | `_templates/新案件範本.md` |
| 病蟲害知識 | `_pests` | `_templates/新病蟲害範本.md` |
| 用藥圖表 | `assets/charts`＋`_data/charts.yml` | 見下方說明 |
| 照片 | `assets/images` | — |

## 在 GitHub 網頁上新增一筆案件

1. 進入 `_cases` 資料夾，按右上角 **Add file → Create new file**
2. 檔名用「日期-簡短英文.md」，例如 `2026-10-20-cabbage-moth.md`
3. 把範本內容貼上、填好
4. 按 **Commit changes** 儲存，約 1～2 分鐘後網站就會更新


## 新增一張用藥圖表

1. 把圖片上傳到 `assets/charts/` 資料夾
2. 打開 `_data/charts.yml`，照著現有格式加一段（`image:` 要填和檔名一模一樣的名字）
3. Commit 後網站的「用藥圖表」頁就會多一張
