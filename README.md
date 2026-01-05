# Brag CLI

一套基於 CLI 的工作日誌自動化工具，協助你快速紀錄日常工作，並利用 AI 自動整理、分類與總結，產出高品質的 Performance Review 素材。

## ✨ 功能特色

- **📝 快速紀錄** - 一行指令快速記錄工作項目，不中斷工作流程
- **🤖 AI 智能整理** - 使用 Google Gemini AI 將流水帳轉換為結構化、有影響力的工作紀錄
- **📊 月度總結** - 自動從每日日誌產生專業的月度總結報告
- **⚡️ TypeScript** - 完整的型別安全與程式碼品質保證
- **✅ 測試覆蓋** - 完整的單元測試確保穩定性

## 📦 安裝

### 前置需求

- Node.js >= 18
- pnpm >= 8

### 安裝步驟

#### 方法一：使用安裝腳本（推薦）

這會將指令安裝到 `~/.local/bin`，不需要 root 權限，也不會污染全域 npm 套件。

1. Clone 此專案：
```bash
git clone <repository-url>
cd brag-doc-cli
```

2. 執行安裝腳本：
```bash
./install.sh
```

3. 確保 `~/.local/bin` 在你的 `PATH` 環境變數中。腳本執行完畢後會提示你如何設定。

#### 方法二：手動安裝

1. 安裝依賴套件：
```bash
pnpm install
```

2. 編譯 TypeScript：
```bash
pnpm build
```

3. 全域安裝：
```bash
pnpm link --global
```

## ⚙️ 環境設定

1. 複製環境變數範例檔案：
```bash
cp .env.example .env
```

2. 取得 Google Gemini API Key：
   - 前往 https://aistudio.google.com/apikey
   - 登入你的 Google 帳號
   - 建立新的 API key

3. 編輯 `.env` 檔案，填入你的設定：
```ini
# [必填] Google Gemini API Key
GEMINI_API_KEY=your_actual_api_key_here

# [選填] 自訂日誌儲存路徑 (預設為專案目錄下的 logs/)
# 支援 $HOME 或 ~
# LOGS_DIR=~/Documents/Work/Logs

# [選填] 自訂月度總結儲存路徑 (預設為專案目錄下的 summaries/)
# SUMMARIES_DIR=~/Documents/Work/Summaries
```

## 🚀 使用指南

### 1. 快速紀錄工作項目 (`brag-add`)

快速新增工作項目到今天的日誌：

```bash
brag-add "修復了登入頁面的記憶體洩漏問題"
brag-add "完成 OAuth 2.0 整合"
brag-add "Code review 了 Alice 的 PR"
```

**功能：**
- 自動建立今天的日誌檔案（如果不存在）
- 加上時間戳記
- 記錄到 `Work Journal` 區塊

**範例輸出：**
```
✓ Added to 2026-01-05.md: - [14:30] 修復了登入頁面的記憶體洩漏問題
```

### 2. AI 優化日誌 (`brag-polish`)

將流水帳轉換為結構化、有影響力的工作紀錄：

```bash
# 優化今天的日誌
brag-polish

# 優化指定日期的日誌
brag-polish 2026-01-03
```

**AI 會自動：**
- 將內容分類到適當的區塊：
  - `Shipped & Deliverables` - 已完成的功能、修復的 Bug
  - `Collaboration & Kudos` - Code Review、協助他人
  - `Technical Challenges & Learnings` - 技術學習與挑戰
- 使用 STAR 原則改寫
- 強調影響力與成果
- 保持專業但自然的語氣

**範例：**
```bash
$ brag-polish
Polishing your journal with AI...
This may take a moment...

✓ Successfully polished 2026-01-05.md
  File: /path/to/logs/2026-01-05.md
```

### 3. 產生月度總結 (`brag-sum`)

從整個月的日誌產生專業的總結報告：

```bash
brag-sum 2026-01
```

**產出內容：**
- 🏆 Top Highlights - 本月最重要的 1-3 個成就
- 📦 Key Deliverables - 依專案分群的重要產出
- 🤝 Collaboration & Influence - 跨團隊合作與 Mentorship
- 🔧 Technical Deep Dives - 技術挑戰與解決方案

**範例：**
```bash
$ brag-sum 2026-01
Finding logs for 2026-01...
Found 20 log(s)
Reading logs...
Generating monthly summary with AI...
This may take a moment...

✓ Successfully generated monthly summary
  File: /path/to/logs/2026-01-summary.md

You can now review and edit the summary file.
```

## 📁 檔案結構

安裝後，你的專案會有以下結構：

```
brag-doc-cli/
├── logs/              # 你的工作日誌（自動建立）
│   ├── 2026-01-05.md  # 每日日誌
│   ├── 2026-01-06.md
│   └── 2026-01-summary.md  # 月度總結
├── templates/         # 日誌模板
│   ├── Daily Log.md
│   └── Monthly Summary.md
└── .env              # 你的 API key（不會被 commit）
```

## 🧪 開發指南

### 執行測試

```bash
# 執行所有測試
pnpm test

# 監視模式
pnpm test:watch

# 測試覆蓋率報告
pnpm test:coverage
```

### 開發模式（不需編譯）

```bash
# 直接執行 TypeScript（使用 tsx）
pnpm dev:add "test content"
pnpm dev:polish
pnpm dev:sum 2026-01
```

### 編譯 TypeScript

```bash
pnpm build
```

## 🛠️ 技術棧

- **Runtime**: Node.js
- **語言**: TypeScript
- **AI SDK**: @google/genai (Google Gemini)
- **CLI 解析**: minimist
- **測試**: Vitest
- **套件管理**: pnpm

## 📝 日誌格式

### Daily Log Template

每日日誌使用以下格式：

```markdown
---
tags:
  - daily-log
  - journal
---

## Work Journal
<!-- 流水帳記錄在這裡 -->

## Shipped & Deliverables
<!-- AI 整理後的完成項目 -->

## Collaboration & Kudos
<!-- 協作與幫助他人的記錄 -->

## Technical Challenges & Learnings
<!-- 技術學習與挑戰 -->

## Brain Dump / Notes
<!-- 隨手筆記 -->
```

## 🔒 安全性

- API key 儲存在 `.env` 檔案，不會被 commit 到 git
- `.gitignore` 已設定排除敏感資訊
- 所有檔案操作都有錯誤處理

## 💡 最佳實踐

1. **每天記錄** - 養成每天使用 `brag-add` 的習慣
2. **週末整理** - 每週使用 `brag-polish` 整理日誌
3. **月底總結** - 月底使用 `brag-sum` 產生總結
4. **定期 Review** - 定期檢視 AI 產生的內容，確保準確性

## 🐛 常見問題

### Q: 為什麼執行指令時出現 "GEMINI_API_KEY is not set" 錯誤？

A: 請確認你已經：
1. 建立 `.env` 檔案
2. 在 `.env` 中設定正確的 API key
3. API key 沒有多餘的空格或引號

### Q: 如何更換 AI 模型？

A: 編輯 `src/ai/gemini.ts`，修改 `model` 參數。可用的模型：
- `gemini-2.5-flash` (預設，快速)
- `gemini-2.5-pro` (更強大)

### Q: 可以自訂日誌模板嗎？

A: 可以！編輯 `templates/Daily Log.md` 或 `templates/Monthly Summary.md` 即可。

## 📄 授權

ISC License

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

---

**Happy Bragging! 🎉**
