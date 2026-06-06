#!/usr/bin/env node

/**
 * ==============================================================================
 * install.js - Antigravity CLI Native Statusline (Footer) 互動式配置程式
 * ==============================================================================
 * 純原生 Node.js 實作，零依賴，提供高質感互動式 CLI 介面：
 * 1. 步驟一：鍵盤方向鍵選擇多國語系。
 * 2. 步驟二：互動式勾選狀態列項目 (Space 切換) 與調整順序 (a/d 或 左右方向鍵)。
 * 3. 全程統一按鍵事件驅動，即時狀態列預覽功能。
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { execSync } = require('child_process');

// ── 0. 動態獲取當前真實環境資訊 ──
const currentCwd = process.cwd();
let currentBranch = 'main';
try {
  currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  try {
    const statusOut = execSync('git status --porcelain', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (statusOut) {
      currentBranch += '*';
    }
  } catch (e) {}
} catch (e) {
  // 忽略
}

// ── 1. 定義顏色與 UI ──
const BLUE = '\x1b[34m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';

// ── 2. 定義路徑 ──
const homeDir = os.homedir();
const globalSettingsFile = path.join(homeDir, '.gemini', 'settings.json');
const cliSettingsDir = path.join(homeDir, '.gemini', 'antigravity-cli');
const cliSettingsFile = path.join(cliSettingsDir, 'settings.json');
const configTemplatePath = path.join(__dirname, 'statusline_config.json');

// ── 3. 欄位中英文對照與預覽資料 ──
const ITEMS_INFO = {
  'project-path': {
    label: '專案路徑 (project-path) - 顯示當前工作目錄的絕對路徑',
    zh: `📁 路徑: ${currentCwd}`,
    en: `📁 Path: ${currentCwd}`,
    jp: `📁 パス: ${currentCwd}`
  },
  'git-branch': {
    label: 'Git 分支 (git-branch) - 顯示目前 Git 分支，修改中會加 *',
    zh: `🌿 分支: ${currentBranch}`,
    en: `🌿 Branch: ${currentBranch}`,
    jp: `🌿 ブランチ: ${currentBranch}`
  },
  'model-name': {
    label: '模型名稱 (model-name) - 顯示當前 AI 模型與 Effort 標記',
    zh: '🤖 模型: Gemini 3.5 Flash',
    en: '🤖 Model: Gemini 3.5 Flash',
    jp: '🤖 モデル: Gemini 3.5 Flash'
  },
  'quota': {
    label: '剩餘額度 (quota) - 顯示當前帳號的剩餘 API 額度比例',
    zh: '🔋 額度: 80%',
    en: '🔋 Quota: 80%',
    jp: '🔋 クオータ: 80%'
  },
  'quota-reset-countdown': {
    label: '重置倒數 (quota-reset-countdown) - 顯示 API 重設計算時間',
    zh: '⏳ 重置: 4h 23m',
    en: '⏳ Reset: 4h 23m',
    jp: '⏳ リセット: 4h 23m'
  },
  'g1-credits': {
    label: 'G1 點數 (g1-credits) - 顯示 G1 Credits 的剩餘餘額',
    zh: '💳 G1: 982',
    en: '💳 G1: 982',
    jp: '💳 G1: 982'
  },
  'context-used': {
    label: 'Context 使用 (context-used) - 顯示已消耗 Context 比例',
    zh: '📊 Ctx: 18.8%',
    en: '📊 Ctx: 18.8%',
    jp: '📊 Ctx: 18.8%'
  },
  'token-count': {
    label: 'Token 數量 (token-count) - 顯示此對話累積消耗的 Token 量',
    zh: '🔢 Tok: 197.1k / 1.0M',
    en: '🔢 Tok: 197.1k / 1.0M',
    jp: '🔢 Tok: 197.1k / 1.0M'
  },
  'memory-usage': {
    label: '記憶體用量 (memory-usage) - 顯示 CLI 當前佔用的實體記憶體用量 (RAM)',
    zh: '💾 RAM: 54MB',
    en: '💾 RAM: 54MB',
    jp: '💾 RAM: 54MB'
  }
};

const allAvailableIds = [
  'project-path',
  'git-branch',
  'model-name',
  'quota',
  'quota-reset-countdown',
  'g1-credits',
  'context-used',
  'token-count',
  'memory-usage'
];

// ── 4. 讀取現有設定或樣板 ──
let templateConfig = {
  footer: {
    hideSandboxStatus: true,
    showLabels: true,
    items: [...allAvailableIds]
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
  // 忽略，將使用預設樣板
}

// 優先嘗試從現有全域 settings.json 讀取目前的 active items 與語系
let currentActiveItems = [];
let hasExistingSettings = false;
let existingLanguage = 'zh-tw';

try {
  if (fs.existsSync(globalSettingsFile)) {
    const raw = fs.readFileSync(globalSettingsFile, 'utf-8');
    const settings = JSON.parse(raw);
    if (settings.ui) {
      if (settings.ui.footer && Array.isArray(settings.ui.footer.items)) {
        currentActiveItems = settings.ui.footer.items;
        hasExistingSettings = true;
      }
      if (settings.ui.language) {
        existingLanguage = settings.ui.language;
      }
    }
  }
} catch (e) {
  // 忽略
}

if (!hasExistingSettings) {
  currentActiveItems = templateConfig.footer.items || allAvailableIds;
}

// 初始化我們的 items 清單
let items = [];
// 1. 先放目前啟用的，並保持其順序
currentActiveItems.forEach(id => {
  if (allAvailableIds.includes(id) && !items.some(i => i.id === id)) {
    items.push({ id, enabled: true });
  }
});
// 2. 再放未啟用的
allAvailableIds.forEach(id => {
  if (!items.some(i => i.id === id)) {
    items.push({ id, enabled: false });
  }
});

// 強制將專案路徑 (project-path) 移動到最前面，以符合使用者習慣
const pathIdx = items.findIndex(i => i.id === 'project-path');
if (pathIdx > 0) {
  const [pathItem] = items.splice(pathIdx, 1);
  items.unshift(pathItem);
}

// ── 5. 互動狀態變數 ──
let step = 1; // 1: 選擇語系, 2: 自訂項目與順序
let selectedLang = existingLanguage || 'zh-tw';
let langCursor = 0;
let itemCursor = 0;

const LANGUAGES = [
  { id: 'zh-tw', label: '繁體中文 (zh-tw)' },
  { id: 'us', label: 'English (en)' },
  { id: 'jp', label: '日本語 (jp)' }
];

// 預設將游標指向先前已選定的語言
const foundLangIdx = LANGUAGES.findIndex(l => l.id === selectedLang);
if (foundLangIdx !== -1) {
  langCursor = foundLangIdx;
}

// ── 6. 核心流程控制 ──
if (!process.stdin.isTTY) {
  console.log(`${YELLOW}⚠ 偵測到非互動式終端機環境，將以預設欄位直接進行套用...${RESET}`);
  const finalItems = items.filter(i => i.enabled).map(i => i.id);
  saveSettings(selectedLang, finalItems);
} else {
  startInteractiveConfig();
}

// ── 7. 互動式編輯介面實作 ──
function startInteractiveConfig() {
  // 啟用 keypress 事件監聽與 RawMode
  readline.emitKeypressEvents(process.stdin);
  try {
    process.stdin.setRawMode(true);
    process.stdin.resume();
  } catch (err) {
    // 預防環境不支援
  }

  const render = () => {
    // 清除終端機畫面並重置游標
    process.stdout.write('\x1b[H\x1b[2J');

    if (step === 1) {
      console.log(`${BLUE}====================================================${RESET}`);
      console.log(`${BLUE}${BOLD}     歡迎使用 Antigravity Statusline 配置工具       ${RESET}`);
      console.log(`${BLUE}====================================================${RESET}`);
      console.log(`\n${BLUE}[步驟 1/2] 請選擇狀態列的顯示語言 / Please select statusline language:${RESET}`);
      console.log(`----------------------------------------------------`);

      LANGUAGES.forEach((lang, idx) => {
        const isCurrent = idx === langCursor;
        const cursorStr = isCurrent ? `${CYAN}➔${RESET}` : ' ';
        if (isCurrent) {
          console.log(` ${cursorStr} ${BOLD}${YELLOW}${lang.label}${RESET}`);
        } else {
          console.log(` ${cursorStr} ${lang.label}`);
        }
      });

      console.log(`----------------------------------------------------`);
      console.log(`${YELLOW}【操作說明】${RESET} ${BOLD}↑ / ↓${RESET} : 移動游標    ${BOLD}Enter${RESET} : 確認選擇    ${BOLD}Ctrl+C${RESET} : 放棄`);
      console.log(`${BLUE}====================================================${RESET}`);
    } else if (step === 2) {
      console.log(`${BLUE}====================================================${RESET}`);
      console.log(`${BLUE}${BOLD}   Antigravity Statusline 項目開關與順序編輯器       ${RESET}`);
      console.log(`${BLUE}====================================================${RESET}`);
      console.log(`\n${YELLOW}【操作說明】${RESET}`);
      console.log(`  ${BOLD}↑ / ↓${RESET} : 移動游標        ${BOLD}Space${RESET} : 開啟/關閉項目`);
      console.log(`  ${BOLD}u${RESET} : 向上移動欄位順序  ${BOLD}d${RESET} : 向下移動欄位順序`);
      console.log(`  ${BOLD}Enter${RESET} : 確認並儲存      ${BOLD}Ctrl+C${RESET} : 放棄並結束`);
      console.log(`----------------------------------------------------`);

      // 輸出項目清單
      items.forEach((item, idx) => {
        const isCurrent = idx === itemCursor;
        const checkbox = item.enabled ? `${GREEN}[✓]${RESET}` : `[ ]`;
        const cursorStr = isCurrent ? `${CYAN}➔${RESET}` : ' ';
        const info = ITEMS_INFO[item.id] || { label: item.id };
        
        // 醒目的排序指引標記
        const orderTip = isCurrent ? `  ${YELLOW}← 按 u/d 可上下移動此項順序${RESET}` : '';

        if (isCurrent) {
          console.log(` ${cursorStr} ${checkbox} ${BOLD}${YELLOW}${info.label}${RESET}${orderTip}`);
        } else {
          console.log(` ${cursorStr} ${checkbox} ${info.label}`);
        }
      });

      console.log(`----------------------------------------------------`);
      console.log(`${BOLD}✨ 狀態列即時預覽 (與 CLI 實際呈現一致) ✨${RESET}`);

      // 渲染狀態列即時預覽
      const enabledItems = items.filter(i => i.enabled).map(i => i.id);

      if (enabledItems.length === 0) {
        console.log(`\n  ${RED}(目前未啟用任何項目，狀態列將為空)${RESET}\n`);
      } else {
        const previewParts = [];
        enabledItems.forEach(id => {
          const info = ITEMS_INFO[id];
          if (info) {
            let val = info.zh;
            if (selectedLang === 'us') val = info.en;
            else if (selectedLang === 'jp') val = info.jp;
            previewParts.push(val);
          }
        });

        console.log();
        // 亮黑色背景 (ANSI 100m) 與亮白色文字 (ANSI 97m)
        const BG_BAR = '\x1b[100m\x1b[97m';
        
        for (let i = 0; i < previewParts.length; i += 4) {
          const line = previewParts.slice(i, i + 4).join('  ');
          console.log(`${BG_BAR}  ${line}  ${RESET}`);
        }
        console.log();
      }
      console.log(`${BLUE}====================================================${RESET}`);
    }
  };

  // 首次渲染
  render();

  // 鍵盤監聽事件處理器
  const onKeypress = (str, key) => {
    if (!key) return;
    
    if (key.ctrl && key.name === 'c') {
      cleanupAndExit();
      return;
    }

    if (step === 1) {
      switch (key.name) {
        case 'up':
        case 'w':
          if (langCursor > 0) {
            langCursor--;
            render();
          }
          break;
        case 'down':
        case 's':
          if (langCursor < LANGUAGES.length - 1) {
            langCursor++;
            render();
          }
          break;
        case 'return':
          selectedLang = LANGUAGES[langCursor].id;
          step = 2;
          render();
          break;
        case 'escape':
          cleanupAndExit();
          break;
      }
    } else if (step === 2) {
      switch (key.name) {
        case 'up':
        case 'w':
          if (itemCursor > 0) {
            itemCursor--;
            render();
          }
          break;
        case 'down':
        case 's':
          if (itemCursor < items.length - 1) {
            itemCursor++;
            render();
          }
          break;
        case 'space':
          items[itemCursor].enabled = !items[itemCursor].enabled;
          render();
          break;
        case 'u':
        case 'left':
        case 'a':
          // 將目前項目往上移動 (往索引 0 移動)
          if (itemCursor > 0) {
            const temp = items[itemCursor];
            items[itemCursor] = items[itemCursor - 1];
            items[itemCursor - 1] = temp;
            itemCursor--;
            render();
          }
          break;
        case 'd':
        case 'right':
          // 將目前項目往下移動 (往索引尾端移動)
          if (itemCursor < items.length - 1) {
            const temp = items[itemCursor];
            items[itemCursor] = items[itemCursor + 1];
            items[itemCursor + 1] = temp;
            itemCursor++;
            render();
          }
          break;
        case 'return': // Enter 鍵
          // 移除監聽器，還原 RawMode
          process.stdin.removeListener('keypress', onKeypress);
          if (process.stdin.isTTY) {
            try {
              process.stdin.setRawMode(false);
            } catch (err) {}
          }
          process.stdin.pause();

          // 儲存設定
          const finalItems = items.filter(i => i.enabled).map(i => i.id);
          saveSettings(selectedLang, finalItems);
          break;
        case 'escape':
          cleanupAndExit();
          break;
      }
    }
  };

  process.stdin.on('keypress', onKeypress);

  function cleanupAndExit() {
    process.stdin.removeListener('keypress', onKeypress);
    if (process.stdin.isTTY) {
      try {
        process.stdin.setRawMode(false);
      } catch (err) {}
    }
    process.stdin.pause();
    console.log(`\n${YELLOW}已取消安裝，未對系統進行任何修改。${RESET}\n`);
    process.exit(0);
  }
}

// ── 8. 寫入設定檔 ──
function saveSettings(selectedLang, finalItems) {
  // ── 8.0 複製 scripts 目錄下的核心檔案至全域 hooks ──
  const hooksDir = path.join(homeDir, '.gemini', 'antigravity-cli', 'hooks');
  try {
    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }
    const scriptsSourceDir = path.join(__dirname, 'scripts');
    const filesToCopy = ['statusline-quota.mjs', 'fetch-local-quota.mjs'];
    
    filesToCopy.forEach(fileName => {
      const srcPath = path.join(scriptsSourceDir, fileName);
      const destPath = path.join(hooksDir, fileName);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`${GREEN}✓ 成功複製檔案至 hooks：${destPath}${RESET}`);
      } else {
        console.log(`${YELLOW}⚠ 找不到原始 scripts 檔案：${srcPath}${RESET}`);
      }
    });
  } catch (err) {
    console.log(`${RED}❌ 複製核心 scripts 檔案至 hooks 失敗：${err.message}${RESET}`);
  }

  // ── 8.1 Windows 平台編譯 sh.exe (越獄無窗體橋接器) ──
  if (process.platform === 'win32') {
    console.log(`\n${BLUE}正在為 Windows 平台編譯靜默 sh.exe 橋接器...${RESET}`);
    try {
      // 取得 CLI 執行目錄
      const agyPathStr = execSync('where agy', { encoding: 'utf8', stdio: ['pipe', 'ignore', 'ignore'] }).trim().split('\n')[0].trim();
      const cliDir = path.dirname(agyPathStr);
      
      // 檢查並清理舊版錯置的 sh.exe (在 node.exe 的目錄下)
      const nodeDir = path.dirname(process.execPath);
      const wrongShPath = path.join(nodeDir, 'sh.exe');
      if (fs.existsSync(wrongShPath)) {
        console.log(`${YELLOW}⚠ 發現舊版錯置的 sh.exe：${wrongShPath}${RESET}`);
        console.log(`${YELLOW}   請手動刪除它以避免污染系統環境！${RESET}`);
      }

      // 動態尋找 csc.exe 並編譯
      const cscPathCmd = `(Get-ChildItem -Path 'C:\\Windows\\Microsoft.NET\\Framework64\\v*\\csc.exe' | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName`;
      const cscPath = execSync(`powershell -NoProfile -Command "${cscPathCmd}"`, { encoding: 'utf8', stdio: ['pipe', 'ignore', 'ignore'] }).trim();
      
      if (cscPath && fs.existsSync(cscPath)) {
        const shHiddenCsPath = path.join(__dirname, 'scripts', 'sh_hidden.cs');
        const outShPath = path.join(cliDir, 'sh.exe');
        if (fs.existsSync(shHiddenCsPath)) {
          execSync(`"${cscPath}" /target:winexe /out:"${outShPath}" "${shHiddenCsPath}"`, { stdio: 'ignore' });
          console.log(`${GREEN}✓ 成功編譯並部署無窗體 sh.exe 至：${outShPath}${RESET}`);
        } else {
          console.log(`${YELLOW}⚠ 找不到原始程式碼：${shHiddenCsPath}，無法編譯 sh.exe${RESET}`);
        }
      } else {
        console.log(`${YELLOW}⚠ 找不到 csc.exe，無法自動編譯 sh.exe，請確認您的系統已安裝 .NET Framework。${RESET}`);
      }
    } catch (e) {
      console.log(`${YELLOW}⚠ 自動編譯 sh.exe 發生錯誤 (可能未安裝 agy CLI)：${e.message}${RESET}`);
    }
  }

  console.log(`\n${BLUE}正在套用狀態列配置至系統設定檔...${RESET}`);

  // 更新本地的 statusline_config.json
  const localConfig = {
    footer: {
      hideSandboxStatus: true,
      showLabels: true,
      items: finalItems
    }
  };

  try {
    fs.writeFileSync(configTemplatePath, JSON.stringify(localConfig, null, 2), { encoding: 'utf8' });
    console.log(`${GREEN}✓ 成功更新本地樣板：statusline_config.json${RESET}`);
  } catch (e) {
    console.log(`${YELLOW}⚠ 無法寫入本地樣板 statusline_config.json：${e.message}${RESET}`);
  }

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
    settings.ui.footer = {
      hideSandboxStatus: true,
      showLabels: true,
      items: finalItems
    };
    settings.ui.language = selectedLang;

    // 確保 statusLine 配置指向全域 hooks 中的 statusline-quota.mjs
    if (!settings.statusLine) settings.statusLine = {};
    settings.statusLine.type = "command";
    settings.statusLine.command = "node " + path.join(homeDir, '.gemini', 'antigravity-cli', 'hooks', 'statusline-quota.mjs');

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

  // ── 9. 完成提示 ──
  console.log(`\n${GREEN}====================================================${RESET}`);
  console.log(`${GREEN}${BOLD}🎉 設定套用成功！狀態列配置已完美生效。             ${RESET}`);
  console.log(`${GREEN}====================================================${RESET}`);
  console.log(`您的 Antigravity CLI 狀態列目前已啟用以下配置：`);
  console.log(`- 顯示語系：${BOLD}${selectedLang}${RESET}`);
  console.log(`- 啟用欄位：${BOLD}${finalItems.join(', ')}${RESET}`);
  console.log(`\n接下來只要啟動 ${BOLD}agy${RESET} 或是 ${BOLD}antigravity${RESET} 時，即可看見高質感的原生 Footer 狀態列！`);
  console.log(`*(提醒：由於是 CLI 內建狀態列，您不需執行任何額外的 bashrc 或環境變數配置。)*\n`);

  process.exit(0);
}
