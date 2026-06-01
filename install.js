#!/usr/bin/env node

/**
 * ==============================================================================
 * install.js - Antigravity CLI Native Statusline (Footer) 配置程式
 * ==============================================================================
 * 純原生 Node.js 實作，零依賴，自動為新環境的 settings.json 配置高質感的
 * 內建狀態列欄位與語系偏好。
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// ── 1. 定義顏色與 UI ──
const BLUE = '\x1b[34m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

console.log(`${BLUE}====================================================${RESET}`);
console.log(`${BLUE}${BOLD}     歡迎使用 Antigravity Statusline 配置工具       ${RESET}`);
console.log(`${BLUE}====================================================${RESET}`);

// ── 2. 定義路徑 ──
const homeDir = os.homedir();
const globalSettingsFile = path.join(homeDir, '.gemini', 'settings.json');
const cliSettingsDir = path.join(homeDir, '.gemini', 'antigravity-cli');
const cliSettingsFile = path.join(cliSettingsDir, 'settings.json');

const configTemplatePath = path.join(__dirname, 'statusline_config.json');

// ── 3. 讀取樣板配置 ──
let templateConfig = {
  footer: {
    hideSandboxStatus: true,
    showLabels: true,
    items: [
      "project-path",
      "git-branch",
      "model-name",
      "quota",
      "quota-reset-countdown",
      "g1-credits",
      "context-used",
      "token-count"
    ]
  }
};

try {
  if (fs.existsSync(configTemplatePath)) {
    const raw = JSON.parse(fs.readFileSync(configTemplatePath, 'utf-8'));
    if (raw && raw.footer) {
      templateConfig = raw;
    }
  }
} catch (e) {
  console.log(`${YELLOW}⚠ 讀取本機樣板失敗，將使用預設的高質感狀態列配置。${RESET}`);
}

// ── 4. 建立互動式選單 ──
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`\n${BLUE}[步驟 1/2] 請選擇狀態列的顯示語言 / Please select statusline language:${RESET}`);
console.log(`  1) 繁體中文 (zh-tw) [預設 / Default]`);
console.log(`  2) English (en)`);
console.log(`  3) 日本語 (jp)`);

rl.question(`\n請輸入選擇 (1, 2 或 3) / Enter choice (1, 2 or 3): `, (answer) => {
  let selectedLang = 'zh-tw';
  if (answer.trim() === '2') {
    selectedLang = 'en';
  } else if (answer.trim() === '3') {
    selectedLang = 'jp';
  }
  
  console.log(`\n${GREEN}✓ 已選擇語系偏好：${selectedLang}${RESET}`);
  
  // ── 5. 執行設定檔寫入 ──
  console.log(`\n${BLUE}[步驟 2/2] 正在套用狀態列配置至系統設定檔...${RESET}`);
  
  const updateSettingsFile = (filePath) => {
    let settings = {};
    const fileDir = path.dirname(filePath);
    
    // 確保資料夾存在
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }
    
    // 讀取既有設定
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        settings = JSON.parse(raw);
      } catch (e) {
        console.log(`${YELLOW}⚠ 偵測到既有的設定檔 ${path.basename(filePath)} 損壞，將為您重新建立。${RESET}`);
        settings = {};
      }
    }
    
    // 確保結構完整
    if (!settings.ui) settings.ui = {};
    
    // 注入狀態列配置與語系
    settings.ui.footer = { ...templateConfig.footer };
    settings.ui.language = selectedLang;
    
    // 額外美化：讓 chat 中顯示 Model 資訊，增強視覺
    settings.ui.showModelInfoInChat = true;
    
    // 寫入檔案
    try {
      fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), { encoding: 'utf8' });
      console.log(`${GREEN}✓ 成功套用設定至：${filePath}${RESET}`);
    } catch (e) {
      console.log(`${RED}❌ 寫入設定檔失敗：${filePath}。錯誤原因：${e.message}${RESET}`);
    }
  };
  
  // 更新全域設定檔與 CLI 專屬設定檔
  updateSettingsFile(globalSettingsFile);
  updateSettingsFile(cliSettingsFile);
  
  // ── 6. 完成提示 ──
  console.log(`\n${GREEN}====================================================${RESET}`);
  console.log(`${GREEN}${BOLD}🎉 設定套用成功！狀態列配置已完美生效。             ${RESET}`);
  console.log(`${GREEN}====================================================${RESET}`);
  console.log(`您的 Antigravity CLI 狀態列目前已啟用以下配置：`);
  console.log(`- 顯示語系：${BOLD}${selectedLang}${RESET}`);
  console.log(`- 啟用欄位：${templateConfig.footer.items.join(', ')}`);
  console.log(`\n接下來只要啟動 ${BOLD}agy${RESET} 或是 ${BOLD}antigravity${RESET} 時，即可看見高質感的原生 Footer 狀態列！`);
  console.log(`*(提醒：由於是 CLI 內建狀態列，您不需執行任何額外的 bashrc 或環境變數配置。)*\n`);
  
  rl.close();
});
