# 訊息整合服務

這是一個使用 Next.js 搭配 Supabase 服務構建的訊息整合管理系統，用於集中管理來自 LINE、Messenger、Instagram Messenger 的訊息。

## 功能

- 根據 session_id 分類並顯示對話列表
- 顯示對話訊息，AI 和使用者訊息分別顯示
- 實時同步訊息數據
- 支持創建新的對話
- 自動 AI 回覆
- 響應式設計，支持移動設備

## 技術棧

- Next.js 15
- React 19
- Tailwind CSS 4
- Supabase (PostgreSQL 和實時功能)
- TypeScript

## 數據庫結構

在 Supabase 中有一個主要表格：`n8n_chat_histories`，包含以下欄位：

- `id`: 自動增長的主鍵
- `session_id`: 對話的唯一標識符
- `message`: 一個 JSONB 欄位，包含 `{ type, content }`
  - `type`: 可以是 'ai' 或 'human'
  - `content`: 訊息內容
- `created_at`: 時間戳

## 安裝與設置

1. 克隆此倉庫
2. 安裝依賴

```bash
npm install
```

3. 在 Supabase 中創建必要的表格：

```sql
CREATE TABLE n8n_chat_histories (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  message JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引以提高查詢性能
CREATE INDEX idx_n8n_chat_histories_session_id ON n8n_chat_histories(session_id);
CREATE INDEX idx_n8n_chat_histories_created_at ON n8n_chat_histories(created_at);
```

4. 創建 `.env.local` 文件，並填入 Supabase 憑證：

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. 啟動開發伺服器

```bash
npm run dev
```

## 使用說明

1. 在左側邊欄中查看所有對話列表
2. 點擊對話以查看詳細訊息
3. 在底部輸入框中輸入新訊息
4. 如果沒有選擇對話，可以點擊「Create New Chat Session」創建新對話
5. 系統會自動產生 AI 回覆

## 部署

要部署到生產環境：

```bash
npm run build
npm run start
```

或者使用 Vercel 部署：

```bash
vercel
```