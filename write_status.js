#!/usr/bin/env node

/**
 * ==============================================================================
 * write_status.js - Antigravity CLI Custom Dual-Line Statusline (Node.js Edition)
 * ==============================================================================
 * 純原生 Node.js 實作，零外部依賴套件 (No npm dependencies)，完美跨平台支援。
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, exec } = require('child_process');
const https = require('https');

// ── 1. 跨平台路徑定義 ──
const homeDir = os.homedir();
const configDir = path.join(homeDir, '.gemini', 'antigravity-cli');
const confJsonFile = path.join(configDir, 'statusline.json');
const tmpDir = os.tmpdir();
const statusTmpFile = path.join(tmpDir, 'antigravity_status');

const creditsCacheFile = path.join(tmpDir, 'antigravity_credits.txt');
const creditsLockFile = path.join(tmpDir, 'antigravity_credits_lock.txt');
const usageCacheFile = path.join(tmpDir, 'antigravity_usage_cache.json');
const apiLockFile = path.join(tmpDir, 'antigravity_api_lock.txt');

// ── 2. 語系設定讀取 ──
let agyLang = 'zh-tw'; // 預設為繁體中文
try {
  if (fs.existsSync(confJsonFile)) {
    const conf = JSON.parse(fs.readFileSync(confJsonFile, 'utf-8'));
    if (conf && conf.lang) {
      agyLang = conf.lang.toLowerCase();
    }
  }
} catch (e) {
  // 忽略設定檔讀取失敗，使用預設值
}

// ── 3. 語系標籤定義 ──
const i18n = {
  'zh-tw': {
    reset: '已重置',
    pending: '待獲取',
    context: 'Context',
    resetLabel: '5h Reset',
    quota: 'Quota'
  },
  en: {
    reset: 'Reset',
    pending: 'Pending',
    context: 'Context',
    resetLabel: '5h Reset',
    quota: 'Quota'
  }
};

const t = i18n[agyLang] || i18n['zh-tw'];

// ── 4. 讀取 stdin 的狀態 JSON ──
let rawStatus = '';
try {
  rawStatus = fs.readFileSync(0, 'utf-8');
} catch (e) {
  // 讀取 stdin 失敗時直接結束
  process.exit(0);
}

if (!rawStatus || rawStatus.trim() === '') {
  process.exit(0);
}

// 寫入暫存檔供外部編輯器/Vim讀取
try {
  fs.writeFileSync(statusTmpFile, rawStatus, 'utf-8');
} catch (e) {}

let status = {};
try {
  status = JSON.parse(rawStatus);
} catch (e) {
  status = {};
}

// ── 5. 獲取核心資訊 ──
const model = (status.model && status.model.display_name) || 'Gemini 3.5';
let remaining = '100';
if (status.context_window && status.context_window.remaining_percentage !== undefined) {
  remaining = String(status.context_window.remaining_percentage).substring(0, 4);
}
const state = status.agent_state || 'idle';
const icon = state === 'working' ? '⚡' : '💤';

// ── 6. 獲取 Git 分支 (防錯處理) ──
let cwd = status.cwd || '';
if (!cwd || cwd === 'null') {
  cwd = process.cwd();
}

let gitBranch = '';
try {
  // 檢查是否處於 Git 工作區
  const isGit = execSync('git rev-parse --is-inside-work-tree', { cwd, stdio: ['ignore', 'pipe', 'ignore'] })
    .toString()
    .trim();

  if (isGit === 'true') {
    const branch = execSync('git symbolic-ref --short HEAD || git rev-parse --short HEAD', { cwd, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();

    if (branch) {
      const isDirty = execSync('git status --porcelain', { cwd, stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim();
      gitBranch = `(${branch}${isDirty ? '*' : ''})`;
    }
  }
} catch (e) {
  // 非 Git 目錄或 Git 指令失敗，保持為空
}

// ── 7. 獲取 Context 比例 ──
let contextPct = '0';
if (status.context_window && status.context_window.used_percentage !== undefined) {
  contextPct = Math.round(Number(status.context_window.used_percentage));
}

// ── 8. 非同步背景獲取 G1 Credits 餘額 ──
const now = Math.floor(Date.now() / 1000);
let needsCreditsFetch = true;

try {
  if (fs.existsSync(creditsLockFile)) {
    const lastCall = parseInt(fs.readFileSync(creditsLockFile, 'utf-8').trim() || '0', 10);
    if (now - lastCall < 180) {
      needsCreditsFetch = false;
    }
  }
} catch (e) {}

if (needsCreditsFetch) {
  try {
    fs.writeFileSync(creditsLockFile, String(now), 'utf-8');
  } catch (e) {}

  // 跨平台執行 agentapi 獲取 credits
  const agentapiPath = os.platform() === 'win32'
    ? path.join(homeDir, '.gemini', 'antigravity-cli', 'bin', 'agentapi.exe')
    : path.join(homeDir, '.gemini', 'antigravity-cli', 'bin', 'agentapi');

  if (fs.existsSync(agentapiPath)) {
    exec(`"${agentapiPath}" --print "/credits"`, (err, stdout) => {
      if (!err && stdout) {
        const match = stdout.match(/G1: \d+/);
        if (match) {
          try {
            fs.writeFileSync(creditsCacheFile, match[0], 'utf-8');
          } catch (e) {}
        }
      }
    });
  }
}

let g1Credits = 'G1: 982';
try {
  if (fs.existsSync(creditsCacheFile)) {
    g1Credits = fs.readFileSync(creditsCacheFile, 'utf-8').trim() || 'G1: 982';
  }
} catch (e) {}

// ── 9. 獲取 5 小時 Reset 剩餘時間 ──
const isoToEpoch = (isoStr) => {
  if (!isoStr) return null;
  const t = Date.parse(isoStr);
  return isNaN(t) ? null : Math.floor(t / 1000);
};

const formatResetTime = (isoStr) => {
  if (!isoStr || isoStr === 'null') return null;
  const epoch = isoToEpoch(isoStr);
  if (!epoch) return null;

  const current = Math.floor(Date.now() / 1000);
  const diff = epoch - current;

  if (diff <= 0) {
    return t.reset;
  }

  const hours = Math.floor(diff / 3600);
  const mins = Math.floor((diff % 3600) / 60);

  if (hours > 0) {
    return `${hours}h${mins}m`;
  } else {
    return `${mins}m`;
  }
};

let needsApiCall = true;
try {
  if (fs.existsSync(apiLockFile)) {
    const lastCall = parseInt(fs.readFileSync(apiLockFile, 'utf-8').trim() || '0', 10);
    if (now - lastCall < 90) {
      needsApiCall = false;
    }
  }
} catch (e) {}

if (needsApiCall) {
  try {
    fs.writeFileSync(apiLockFile, String(now), 'utf-8');
  } catch (e) {}

  const token = process.env.CLAUDE_CODE_OAUTH_TOKEN;
  if (token && token !== 'null') {
    const options = {
      hostname: 'api.anthropic.com',
      path: '/api/oauth/usage',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'anthropic-beta': 'oauth-2025-04-20',
        'User-Agent': 'claude-code/2.1.34'
      },
      timeout: 3000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed.five_hour) {
            fs.writeFileSync(usageCacheFile, JSON.stringify(parsed), 'utf-8');
          }
        } catch (e) {}
      });
    });

    req.on('error', () => {});
    req.on('timeout', () => { req.destroy(); });
    req.end();
  }
}

let resetTime = t.pending;
try {
  if (fs.existsSync(usageCacheFile)) {
    const usage = JSON.parse(fs.readFileSync(usageCacheFile, 'utf-8'));
    if (usage && usage.five_hour && usage.five_hour.resets_at) {
      resetTime = formatResetTime(usage.five_hour.resets_at) || t.pending;
    }
  }
} catch (e) {}

// ── 10. 顯示完整路徑 ──
let displayCwd = cwd;
if (cwd.startsWith(homeDir)) {
  displayCwd = '~' + cwd.substring(homeDir.length);
}

// ── 11. 極致美觀雙行排版設計 ──
const line1 = `📁 ${displayCwd}${gitBranch ? `  🌿 ${gitBranch}` : ''}  ${icon}  ${model}`;
const line2 = `📊 ${t.context}: ${contextPct}%  │  ⟳ ${t.resetLabel}: ${resetTime}  │  💳 ${g1Credits}  │  🔋 ${t.quota}: ${remaining}%`;

console.log(line1);
console.log(line2);
