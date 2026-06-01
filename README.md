# Antigravity CLI Custom Statusline (agy_status)

一個專為 **Antigravity CLI (agy)** 設計的高質感客製化雙行狀態列 (Statusline)。

本專案參考自 [AndyAWD/antigravity-cli-statusline](https://github.com/AndyAWD/antigravity-cli-statusline) 的架構靈感，並針對狀態列的顯示行為進行了客製化調整。它能自動接收來自 Antigravity CLI 的即時狀態 JSON payload，並渲染出兼具美感與實用性的終端機雙行狀態列。

---

## 🎨 狀態列排版設計 (多語系支援)

### 繁體中文 (zh-tw)
```
📁 ~/your-project-path  🌿 (main*)  💤  Gemini 3.5 Flash
📊 Context: 12%  │  ⟳ 5h Reset: 4h12m  │  💳 G1: 982  │  🔋 Quota: 85.5%
```
*(若 API 在重置狀態，會於 5h Reset 中顯示 **「已重置」**；載入中會顯示 **「待獲取」**。)*

### 英文 (en)
```
📁 ~/your-project-path  🌿 (main*)  💤  Gemini 3.5 Flash
📊 Context: 12%  │  ⟳ 5h Reset: 4h12m  │  💳 G1: 982  │  🔋 Quota: 85.5%
```
*(若 API 在重置狀態，會於 5h Reset 中顯示 **「Reset」**；載入中會顯示 **「Pending」**。)*

---

## ✨ 特色指標說明

### 第一行：核心環境資訊
- **📁 工作路徑**：自動將您的 `$HOME` 路徑縮寫為 `~`，保持簡潔。
- **🌿 Git 分支**：自動偵測目前的 Git 分支名稱。若有未 commit 的變更，會標記為 `*` 狀態（如：`(main*)`）。
- **⚡/💤 代理狀態**：以動態的閃電 ⚡ (運算中) 或睡覺 💤 (閒置) 圖示即時反應 Agent 運作狀態。
- **🤖 AI 模型名稱**：顯示目前正在對話的 AI 模型（例如：`Gemini 3.5 Flash`）。

### 第二行：配額與資源監控
- **📊 Context 百分比**：即時顯示目前已消耗的 Context Window 比例。
- **⟳ 5h Reset 倒數**：顯示下一次 5 小時 API 限制次數重置的剩餘時間。
- **💳 G1 Credits 餘額**：非同步背景取得您的 G1 Credits 餘額（不造成啟動阻塞）。
- **🔋 Quota 剩餘比例**：顯示當前帳號的可用 Quota 百分比。

---

## 🚀 快速安裝與配置步驟

我們提供了全新升級的**互動式自動安裝腳本**，以便您在新環境中快速部署並自由切換語系。

### 1. 複製並安裝
在您克隆專案後，直接執行資料夾內的 `install.sh`：

```bash
# 進入目錄
cd agy_status

# 執行互動式安裝
./install.sh
```

### 2. 安裝時的互動選擇
執行腳本後，您將會看見以下選單，可直接輸入 `1` 或 `2` 來決定狀態列顯示的語言：

```
====================================================
     歡迎使用 Antigravity Statusline 安裝與配置      
====================================================

[步驟 1/3] 請選擇狀態列顯示語系 / Please select statusline language:
  1) 繁體中文 (zh-tw) [預設 / Default]
  2) English (en)
輸入選擇 (1 或 2) / Enter choice (1 or 2): 
```

> [!TIP]
> 安裝腳本會將設定好的語系寫入至 `~/.gemini/antigravity-cli/statusline.conf` 中，核心狀態列腳本在啟動時會自動讀取此設定檔，確保多語系運作流暢且與核心代碼解耦。

### 3. 啟用狀態列
安裝完成後，請執行以下命令以立即在當前終端機視窗中啟用它：

```bash
source ~/.bashrc
```

接下來，每次您執行 `agy` 或是 `antigravity` 時，最下方都會顯示您選定語言的精美雙行狀態列！

---

## 🔄 卸載方法

如果您想要移除此狀態列並恢復系統預設顯示，可以使用內建的卸載腳本：

```bash
# 執行卸載
./uninstall.sh

# 重新載入環境變數以套用
source ~/.bashrc
```

> [!NOTE]
> 卸載腳本會完全刪除複製到 `~/.gemini/antigravity-cli/` 的檔案（包含腳本及語系設定檔），並自動清除 `~/.bashrc` 中寫入的環境變數，不留任何痕跡。

---

## 📄 授權條款

本專案採用 [MIT License](LICENSE) 授權。
