# Antigravity CLI Custom Native Statusline Configuration (agy_status)

一個專為 **Antigravity CLI (agy)** 設計的高質感**原生狀態列 (Native Footer)** 一鍵配置工具。

本專案基於 [AndyAWD/antigravity-cli-statusline](https://github.com/AndyAWD/antigravity-cli-statusline) 的架構靈感，並使用**純原生 Node.js (零外部依賴)** 實作，能完美相容於 **Windows、macOS 與 Linux**。它會自動在全域部署核心數據抓取與渲染腳本（`statusline-quota.mjs` 與 `fetch-local-quota.mjs`），並為您的全域及 CLI 專屬設定檔（`settings.json`）注入自訂狀態列指令與欄位排序設定，提供互動式的語言與欄位編輯選單！

---

## 🎨 實際輸出樣式預覽 (與真實 CLI 頁尾 100% 一致)

狀態列會顯示在 Antigravity 互動介面的最底部。根據您安裝時選擇的語系，它會以極佳的高對比度完美呈現以下外觀與指標：

### 📌 繁體中文版本 (zh-tw) 實際畫面
當您啟用繁體中文語系時，真實的狀態列顯示如下：

```text
📁 路徑: /root/code/playground/agy_status  🌿 分支: main  🤖 模型: Gemini 3.5 Flash (Medium)  🔋 額度: 80%  ⏳ 重置: 4h 23m
💳 G1: 982  📊 Ctx: 18.8%  🔢 Tok: 197.1k / 1.0M
```

### 📌 英文版本 (en) 實際畫面
當您啟用英文語系時，真實的狀態列顯示如下：

```text
📁 Path: /root/code/playground/agy_status  🌿 Branch: main  🤖 Model: Gemini 3.5 Flash (Medium)  🔋 Quota: 80%  ⏳ Reset: 4h 23m
💳 G1: 982  📊 Ctx: 18.8%  🔢 Tok: 197.1k / 1.0M
```

---

## ✨ 狀態列指標排序與特色

本專案安裝後，會將狀態列依序啟用以下 9 大指標：
1. **📁 專案路徑 (`project-path`)**：顯示當前工作目錄的絕對路徑。本指標具備**智慧響應式寬度調整 (RWD) 特性**，會自動根據您當前的終端機寬度（螢幕寬度）動態決定顯示簡短專案名或完整絕對路徑，不需手動配置其他重複的指標。
2. **🌿 Git 分支 (`git-branch`)**：偵測當前 Git 分支。若工作區有未提交的 dirty 變更，會自動標記 `*`（如：`(main*)`）。
3. **🤖 模型與 Effort 標記 (`model-name`)**：顯示當前對話採用的 AI 模型與思考深度（例如：`Gemini 3.5 Flash (Medium)`）。
4. **🔋 可用額度 (`quota`)**：顯示當前帳號的剩餘 API 額度百分比。
5. **⏳ 重置倒數 (`quota-reset-countdown`)**：顯示 API 額度限制重新計算的剩餘時間。
6. **💳 G1 Credits (`g1-credits`)**：顯示 G1 Credits 的餘額。
7. **📊 Context 消耗 (`context-used`)**：即時顯示目前已消耗的 Context Window 比例。
8. **🔢 Token 總數 (`token-count`)**：顯示當前對話所累積消耗的精確 Token 量。
9. **💾 記憶體用量 (`memory-usage`)**：顯示 CLI 當前實體記憶體用量 (RAM)。

---

## 🚀 快速安裝與配置步驟

在您的新環境中 clone 本專案後，只要直接執行 `install.js` 即可完成全平台一鍵配置。

### 📌 各平台一鍵安裝指令

- **Windows 平台 (PowerShell / CMD)**：
  ```bash
  node install.js
  ```
- **macOS / Linux 平台 (Terminal)**：
  ```bash
  ./install.js
  ```

### 💬 互動式安裝與自訂步驟

執行安裝後，您將進入精心設計的高質感終端機互動選單：

#### 📌 步驟 1：選擇顯示語言
您可以使用鍵盤的 **`[↑ / ↓]`** 方向鍵（或 `[w / s]`）移動指針 `➔` 來選擇您的語系偏好，選定後按 **`[Enter]`** 送出：

```text
====================================================
     歡迎使用 Antigravity Statusline 配置工具       
====================================================

[步驟 1/2] 請選擇狀態列的顯示語言 / Please select statusline language:
----------------------------------------------------
 ➔ 繁體中文 (zh-tw)
   English (en)
   日本語 (jp)
----------------------------------------------------
【操作說明】 ↑ / ↓ : 移動游標    Enter : 確認選擇    Ctrl+C : 放棄
====================================================
```

#### 📌 步驟 2：自訂狀態列欄位與排序
進入欄位編輯器後，您可以完全自由地勾選顯示指標並調整位置：
- 使用 **`[↑ / ↓]`** 方向鍵（或 `[w / s]`）：移動黃色高亮游標。
- 使用 **`[Space]`**（空白鍵）：切換勾選狀態（`[✓]` 表示啟用，`[ ]` 表示關閉）。
- 使用 **`[u]` 鍵 (Up) / `[d]` 鍵 (Down)**：**直接將該選定欄位在列表中向上或向下移動（調整排序順序）**（同樣相容 `[← / →]` 方向鍵與 `[a]` 鍵）。
- 畫面下方會以深灰色實體 Bar 背景**即時模擬預覽**狀態列在真實 CLI 中的呈現長相！
- 調整完成後，按下 **`[Enter]`** 鍵即可保存並寫入設定。

```text
====================================================
   Antigravity Statusline 項目開關與順序編輯器       
====================================================

【操作說明】
  ↑ / ↓ : 移動游標        Space : 開啟/關閉項目
  u : 向上移動欄位順序  d : 向下移動欄位順序
  Enter : 確認並儲存      Ctrl+C : 放棄並結束
----------------------------------------------------
 ➔ [✓] 專案路徑 (project-path) - 顯示當前工作目錄的絕對路徑  ← 按 u/d 可上下移動此項順序
   [✓] Git 分支 (git-branch) - 顯示目前 Git 分支，修改中會加 *
   [✓] 模型名稱 (model-name) - 顯示當前 AI 模型與 Effort 標記
   [ ] 剩餘額度 (quota) - 顯示當前帳號的剩餘 API 額度比例
...
----------------------------------------------------
✨ 狀態列即時預覽 (與 CLI 實際呈現一致) ✨

  📁 路徑: /root/code/playground/agy_status  🌿 分支: main  🤖 模型: Gemini 3.5 Flash  

====================================================
```

> [!IMPORTANT]
> 安裝程式會自動將自訂的配置寫入至您的全域 `~/.gemini/settings.json` 與 CLI 專屬 `~/.gemini/antigravity-cli/settings.json` 中。
> 由於這是 Antigravity CLI 的**內建 Footer 功能**，您**完全不需要**在 `~/.bashrc` 或系統環境變數中編寫任何 shell 程式碼，既安全、乾淨又 100% 穩定！

---

## 🗑️ 恢復原廠預設狀態

如果您想要移除此狀態列配置並恢復為原廠最精簡的狀態，只需在專案目錄下執行還原腳本即可：

- **Windows**：
  ```bash
  node uninstall.js
  ```
- **macOS / Linux**：
  ```bash
  ./uninstall.js
  ```

---

## 📄 授權條款

本專案採用 [MIT License](LICENSE) 授權。
