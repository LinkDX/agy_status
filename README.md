# Antigravity CLI Custom Native Statusline Configuration (agy_status)

一個專為 **Antigravity CLI (agy)** 設計的高質感**原生狀態列 (Native Footer)** 一鍵配置工具。

本專案使用**純原生 Node.js (零外部依賴)** 實作，能完美相容於 **Windows、macOS 與 Linux**。它會自動為您的全域及 CLI 專屬設定檔（`settings.json`）注入目前這台電腦上最完整、最高質感的原生狀態列排序與欄位指標設定，並提供互動式的語言選擇！

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

本專案安裝後，會將狀態列依序啟用以下 8 大核心指標：
1. **📁 專案路徑 (`project-path`)**：顯示當前工作目錄的絕對路徑。
2. **🌿 Git 分支 (`git-branch`)**：偵測當前 Git 分支。若工作區有未提交的 dirty 變更，會自動標記 `*`（如：`(main*)`）。
3. **🤖 模型與 Effort 標記 (`model-name`)**：顯示當前對話採用的 AI 模型與思考深度（例如：`Gemini 3.5 Flash (Medium)`）。
4. **🔋 可用額度 (`quota`)**：顯示當前帳號的剩餘 API 額度百分比。
5. **⏳ 重置倒數 (`quota-reset-countdown`)**：顯示 API 額度限制重新計算的剩餘時間。
6. **💳 G1 Credits (`g1-credits`)**：顯示 G1 Credits 的餘額。
7. **📊 Context 消耗 (`context-used`)**：即時顯示目前已消耗的 Context Window 比例。
8. **🔢 Token 總數 (`token-count`)**：顯示當前對話所累積消耗的精確 Token 量。

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

### 💬 互動式安裝步驟

執行安裝後，安裝程式會跳出語系選擇，可直接輸入 `1`、`2` 或 `3` 來切換：

```
====================================================
     歡迎使用 Antigravity Statusline 配置工具       
====================================================

[步驟 1/2] 請選擇狀態列的顯示語言 / Please select statusline language:
  1) 繁體中文 (zh-tw) [預設 / Default]
  2) English (en)
  3) 日本語 (jp)

請輸入選擇 (1, 2 或 3) / Enter choice (1, 2 or 3): 
```

> [!IMPORTANT]
> 安裝程式會自動將此配置寫入至您的 `~/.gemini/settings.json` 與 `~/.gemini/antigravity-cli/settings.json`。
> 由於這是 Antigravity CLI 的**內建 Footer 功能**，您**完全不需要**在 `~/.bashrc` 或系統環境變數中寫入任何代碼，安全、乾淨且 100% 穩定！

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
