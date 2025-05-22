# 專案管理系統 Project Tracking System

一套以 Next.js 與 Ant Design 打造的現代化專案管理平台，支援專案/任務追蹤、日曆/甘特圖視覺化、團隊協作、績效統計、稽核管理等多元功能，適用於企業或團隊專案流程數位化。

---

## 目錄

- [專案簡介](#專案簡介)
- [功能特色](#功能特色)
- [技術架構](#技術架構)
- [安裝與啟動](#安裝與啟動)
- [資料庫結構](#資料庫結構)
- [API 概覽](#api-概覽)
- [RWD 與互動設計](#rwd-與互動設計)
- [常見問題](#常見問題)
- [貢獻指南](#貢獻指南)
- [授權](#授權)

---

## 專案簡介

本系統整合專案、任務、團隊、日曆、甘特圖、稽核、績效等模組，提供直覺的操作介面與豐富的統計分析，協助用戶高效管理專案進度與團隊協作。

## 功能特色

- **專案/任務管理**：支援 CRUD、依賴關係、標籤、進度追蹤、權限控管。
- **日曆/甘特圖視覺化**：整合 react-big-calendar，支援多視圖、條件篩選、詳情彈窗。
- **團隊與部門管理**：成員自動帶入部門、部門清單 API。
- **績效與統計分析**：專案完成率、效率指數、延遲專案、統計圖表。
- **稽核專區**：稽核資料 CRUD、部門稽核紀錄。
- **通知與日誌**：任務/專案異動通知、操作日誌。
- **RWD 響應式設計**：支援桌機、平板、手機瀏覽。
- **PDF 匯出**：支援中文字型嵌入，避免亂碼。


## 技術架構

- **前端**：Next.js 14、React 18、Ant Design、react-big-calendar
- **後端**：Next.js API Route、Node.js
- **資料庫**：Microsoft SQL Server（MSSQL）
- **其他**：TypeScript、ESLint、JWT、PDFKit

> **注意：**
> 本專案預設以 Microsoft SQL Server 為主要資料庫，若需支援 SQLite、MySQL、PostgreSQL，請參考 `src/lib/schema.sql` 並手動建立資料表。

## 安裝與啟動

1. **安裝依賴**
   ```bash
   npm install
   ```
2. **初始化資料庫**
   ```bash
   npm run init-db
   ```
   或執行 `scripts/init-db.js` 初始化 SQLite。
3. **啟動開發伺服器**
   ```bash
   npm run dev
   ```
4. **瀏覽系統**
   - 預設網址：http://localhost:3000

### 資料庫初始化說明

1. **自動建立所有資料表**
   - 執行下列指令即可自動建立所有資料表（包含子任務、協作請求、使用者等）：
     ```bash
     npm run init-db
     ```
   - 或直接執行：
     ```bash
     node scripts/init-db.js
     ```
   - 預設會自動執行 `src/lib/schema.sql` 內容，無需手動建表。

2. **如需自訂資料表結構，請編輯 `src/lib/schema.sql`，再重新執行初始化指令。**

## 資料庫結構

- 主要資料表：projects、tasks、team、departments、audit、calendar_events、notifications、logs 等。
- 結構定義詳見 `src/lib/schema.sql`。

## API 概覽

- RESTful API 路徑：`/api/{module}/`
- 支援 GET/POST/PUT/DELETE，涵蓋專案、任務、團隊、稽核、日曆等模組。
- 例：
  - `GET /api/projects`：取得專案列表
  - `POST /api/tasks`：新增任務
  - `PUT /api/calendars/{id}`：更新日曆事件
  - `DELETE /api/audit/{id}`：刪除稽核紀錄
- 詳細參數與回傳格式請參閱各 API 檔案。

## RWD 與互動設計

- 採用 Ant Design 元件與自訂 CSS，支援多裝置響應式。
- 日曆/甘特圖支援拖曳、彈窗、條件篩選。
- 任務管理支援依賴關係、標籤、進階搜尋。

## 常見問題

- **PDF 匯出亂碼**：請確認已嵌入中文字型。
- **日曆事件顯示異常**：請確認事件 start/end 為 Date 物件。


> **注意：**
>1. `npm run init-db` 只適用於已安裝 Microsoft SQL Server 的環境。
>2. 若您使用其他資料庫（如 SQLite、MySQL、PostgreSQL），請參考 `src/lib/schema.sql`，用對應資料庫工具手動建立資料表，或聯絡開發者取得相容腳本。

## 貢獻指南

1. Fork 本專案並建立分支。
2. 提交 Pull Request 前請確保通過 lint 與測試。
3. 重要修正請附上說明與測試案例。

## 授權

本專案採用 MIT License 授權。