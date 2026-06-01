# Antigravity CLI Custom Statusline (agy_status)

一個專為 **Antigravity CLI (agy)** 設計的高質感客製化雙行狀態列 (Statusline)。

本專案參考自 [AndyAWD/antigravity-cli-statusline](https://github.com/AndyAWD/antigravity-cli-statusline) 的架構靈感，並使用**純原生 Node.js (不依賴任何外部 npm 套件)** 進行全平台重構。同一份核心代碼能 100% 完美且穩定地在 **Windows、macOS 與 Linux** 上運行！

它能自動接收來自 Antigravity CLI 的即時狀態 JSON payload，並渲染出兼具美感與實用性的終端機雙行狀態列。

---

## 🎨 實際輸出樣式預覽 (與真實程式碼 100% 一致)

狀態列會依據您安裝時選擇的語系（繁體中文 或 英文）動態呈現對應的文字。

### 📌 繁體中文版本 (zh-tw)
當您剛啟動或處於重置狀態時，將會呈現以下真實外觀：

```text
📁 ~/your-project-path  🌿 (main*)  💤  Gemini 3.5
📊 Context: 12%  │  ⟳ 5h Reset: 待獲取  │  💳 G1: 982  │  🔋 Quota: 85.5%
```
*(若 API 的五小時限制已完成重置，狀態會自動自癒顯示為：`⟳ 5h Reset: 已重置`)*

### 📌 英文版本 (en)
若您選擇英文語系，提示文字會自動本地化，呈現以下真實外觀：

```text
📁 ~/your-project-path  🌿 (main*)  💤  Gemini 3.5
📊 Context: 12%  │  ⟳ 5h Reset: Pending  │  💳 G1: 982  │  🔋 Quota: 85.5%
```
*(若 API 的五小時限制已完成重置，狀態會自動自癒顯示為：`⟳ 5h Reset: Reset`)*

---

## ✨ 特色與跨平台優勢

- **真正的跨平台相容**：改用純 JavaScript (Node.js) 實作核心，完全抹平了 Windows、macOS 與 Linux 在系統指令（如 `date`, `curl`）上的參數差異。
- **免安裝外部依賴**：完全採用 Node.js 內建核心模組（如 `fs`, `path`, `https`, `child_process`），**不需要執行 `npm install`**，開箱即用。
- **Git 分支自動偵測**：自動偵測目前的 Git 分支名稱。若有未 commit 的變更，會標記為 `*` 狀態（如：`(main*)`）。
- **配額與資源監控**：即時顯示 Context Window 比例、5 小時重置倒數、背景非同步抓取的 G1 Credits 餘額以及可用 Quota 百分比。

---

## 🚀 快速安裝與配置步驟

我們針對 Linux/macOS 以及 Windows 平台，分別提供了一鍵式自動安裝腳本。

### 📌 Linux / macOS 平台

1. **執行自動安裝**：
   在您克隆專案後，直接執行資料夾內的 `install.sh`：
   ```bash
   cd agy_status
   ./install.sh
   ```

2. **選擇語言與套用**：
   在出現的互動選單中輸入 `1` (繁體中文) 或 `2` (英文)。安裝完成後，執行以下命令啟用：
   ```bash
   source ~/.bashrc
   ```

---

### 📌 Windows 平台 (CMD / PowerShell)

1. **以 PowerShell 執行安裝**：
   開啟您的 PowerShell 視窗，進入專案目錄並執行 `install.ps1` 腳本：
   ```powershell
   cd agy_status
   .\install.ps1
   ```

2. **選擇語言**：
   在出現的互動選單中輸入 `1` (繁體中文) 或 `2` (英文)。

3. **重啟終端機**：
   安裝程式會自動為您註冊 Windows 使用者環境變數，完成後**只需重新開啟終端機**即可啟用！

> [!TIP]
> 安裝程式會將設定好的語系以 JSON 寫入至 `~/.gemini/antigravity-cli/statusline.json` 中，核心狀態列腳本在啟動時會自動讀取此設定檔，確保多語系運作流暢且與核心代碼解耦。

---

## 🗑️ 卸載方法

如果您想要移除此狀態列並恢復系統預設顯示，可以使用各平台內建的卸載腳本：

- **Linux / macOS**：
  ```bash
  ./uninstall.sh && source ~/.bashrc
  ```
- **Windows**：
  在 PowerShell 中執行：
  ```powershell
  .\uninstall.ps1
  ```

---

## 📄 授權條款

本專案採用 [MIT License](LICENSE) 授權。
