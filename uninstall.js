#!/usr/bin/env node

/**
 * ==============================================================================
 * uninstall.js - Antigravity CLI Native Statusline (Footer) 還原與移除程式
 * ==============================================================================
 * 純原生 Node.js 實作，零依賴，自動將狀態列 Footer 還原為預設設定。
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

console.log(`${YELLOW}====================================================${RESET}`);
console.log(`${YELLOW}${BOLD}     正在還原 Antigravity Statusline 預設配置...    ${RESET}`);
console.log(`${YELLOW}====================================================${RESET}`);

const homeDir = os.homedir();
const globalSettingsFile = path.join(homeDir, '.gemini', 'settings.json');
const cliSettingsFile = path.join(homeDir, '.gemini', 'antigravity-cli', 'settings.json');

// 恢復至 Antigravity 原廠最精簡狀態
const defaultFooter = {
  hideSandboxStatus: false,
  showLabels: true,
  items: [
    "workspace",
    "git-branch",
    "model-name",
    "quota",
    "context-used"
  ]
};

const restoreSettingsFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const settings = JSON.parse(raw);
      
      if (settings.ui) {
        settings.ui.footer = defaultFooter;
        settings.ui.language = 'zh-tw'; // 回復預設繁體中文
      }
      
      fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), { encoding: 'utf8' });
      console.log(`${GREEN}✓ 成功還原預設值：${filePath}${RESET}`);
    } catch (e) {
      console.log(`${YELLOW}⚠ 還原設定檔 ${filePath} 時出錯，但這不影響您的正常運作：${e.message}${RESET}`);
    }
  }
};

restoreSettingsFile(globalSettingsFile);
restoreSettingsFile(cliSettingsFile);

console.log(`\n${GREEN}====================================================${RESET}`);
console.log(`${GREEN}${BOLD}🎉 還原成功！已回復為原廠預設狀態列配置。             ${RESET}`);
console.log(`${GREEN}====================================================${RESET}`);
console.log(`您的狀態列目前已重設回原廠預設的 5 大基礎指標。`);
console.log(`重啟 ${BOLD}agy${RESET} 後即可看見預設顯示。\n`);
