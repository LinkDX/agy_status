import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { spawn, execSync } from 'child_process';
import { join, basename } from 'path';
import os from 'os';

function getGitBranch(lang) {
  try {
    const opts = { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true };
    let branch = '';
    try {
      branch = execSync('git rev-parse --abbrev-ref HEAD', opts).trim();
    } catch (err) {
      if (process.platform === 'win32') {
        const gitPath = 'C:\\Program Files\\Git\\cmd\\git.exe';
        if (existsSync(gitPath)) {
          branch = execSync(`"${gitPath}" rev-parse --abbrev-ref HEAD`, opts).trim();
        }
      }
    }
    return branch || (lang === 'zh-tw' ? '無版本控制' : (lang === 'jp' ? 'バージョン管理なし' : 'No VC'));
  } catch (e) {
    return lang === 'zh-tw' ? '無版本控制' : (lang === 'jp' ? 'バージョン管理なし' : 'No VC');
  }
}

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const ORANGE = "\x1b[38;5;208m";
const RED = "\x1b[31m";

// 四階梯色彩辨識：100~75% 綠、74~50% 黃、49~25% 澄、24~0% 紅
function getColorByPercentage(pct) {
  if (pct >= 75) return GREEN;
  if (pct >= 50) return YELLOW;
  if (pct >= 25) return ORANGE;
  return RED;
}

// 根據模型家族取得色彩 (Claude: #dd5013, Gemini: #4796e3, GPT: #74aa9c)
function getModelColor(name) {
  const lower = (name || '').toLowerCase();
  if (lower.includes('claude')) return "\x1b[38;2;221;80;19m";
  if (lower.includes('gemini')) return "\x1b[38;2;71;150;227m";
  if (lower.includes('gpt') || lower.includes('chatgpt')) return "\x1b[38;2;116;170;156m";
  return "";
}

// 清理 ANSI 碼以計算純文字長度
function stripAnsi(str) {
  return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

function getCliMemoryMB() {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`wmic process where "name='agy.exe'" get WorkingSetSize`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });
      const matches = output.match(/\d+/g);
      if (matches) {
        const totalBytes = matches.reduce((sum, val) => sum + parseInt(val, 10), 0);
        return Math.round(totalBytes / 1024 / 1024);
      }
    } else {
      const output = execSync(`ps -o rss= -p ${process.ppid}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });
      const memKb = parseInt(output.trim(), 10);
      if (!isNaN(memKb)) return Math.round(memKb / 1024);
    }
  } catch (e) {}
  return Math.round(process.memoryUsage().rss / 1024 / 1024);
}

function getDisplayWidth(str) {
  let width = 0;
  for (let i = 0; i < str.length; i++) {
    width += str.charCodeAt(i) > 0x7F ? 2 : 1;
  }
  return width;
}

function getSettings() {
  const globalPath = join(os.homedir(), '.gemini', 'settings.json');
  const projectPath = join(process.cwd(), '.gemini', 'settings.json');
  let settings = {};
  try { if (existsSync(globalPath)) settings = JSON.parse(readFileSync(globalPath, 'utf8')); } catch (e) {}
  try {
    if (existsSync(projectPath)) {
      const projSettings = JSON.parse(readFileSync(projectPath, 'utf8'));
      settings = { ...settings, ...projSettings };
      if (projSettings.ui) {
        settings.ui = { ...settings.ui, ...projSettings.ui };
        if (projSettings.ui.footer) settings.ui.footer = { ...settings.ui.footer, ...projSettings.ui.footer };
      }
    }
  } catch (e) {}
  return settings;
}

function formatTokens(num) {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

function normalizeModelName(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

async function main() {
  if (process.env.DISABLE_QUOTA_HOOK) process.exit(0);
  let meta = {};

  try {
    // 讀取 stdin
    let stdinStr = '';
    const readPromise = new Promise((resolve) => {
      let data = '';
      let timer = setTimeout(() => resolve(data), 50);
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', chunk => data += chunk);
      process.stdin.on('end', () => { clearTimeout(timer); resolve(data); });
    });
    stdinStr = await readPromise;
    try { if (stdinStr.trim()) meta = JSON.parse(stdinStr); } catch (e) {}

    const settings = getSettings();
    
    // 智慧響應式寬度調整 (RWD)
    const termWidth = meta?.terminal_width || process.stdout.columns || 80;
    // 智慧折行臨界寬度，保留 10 格防止邊界溢出
    const wrapWidth = Math.max(40, termWidth - 10);
    
    let fallbackModel = 'Gemini 3.5 Flash (High)';
    if (meta?.model?.display_name) fallbackModel = meta.model.display_name;
    else if (meta?.model?.id) fallbackModel = meta.model.id;
    
    // 退讓模式
    if (!settings?.ui?.footer?.items) {
      const leftText = '? for shortcuts';
      const rightText = fallbackModel;
      let width = 0;
      for (let i = 0; i < leftText.length; i++) width += leftText.charCodeAt(i) > 0x7F ? 2 : 1;
      let rWidth = 0;
      for (let i = 0; i < rightText.length; i++) rWidth += rightText.charCodeAt(i) > 0x7F ? 2 : 1;
      const spacesCount = Math.max(1, wrapWidth - width - rWidth - 1);
      const spaces = ' '.repeat(spacesCount);
      console.log(`${leftText}${spaces}${rightText}`);
      process.exit(0);
    }
    
    const lang = settings?.ui?.language || 'zh-tw';
    const footerItems = settings.ui.footer.items;
    
    const cachePath = join(os.homedir(), '.gemini', 'tmp', 'real_quota_cache.json');
    let cache = null;
    let needUpdate = true;
    
    try {
      if (existsSync(cachePath)) {
        cache = JSON.parse(readFileSync(cachePath, 'utf8'));
        if (Date.now() - (cache.updatedAt || 0) < 30000) needUpdate = false;
      }
    } catch (e) {}

    if (needUpdate) {
      try {
        const updaterScript = join(os.homedir(), '.gemini', 'antigravity-cli', 'hooks', 'fetch-local-quota.mjs');
        if (existsSync(updaterScript)) {
          spawn('node', [updaterScript], {
            env: { ...process.env, DISABLE_QUOTA_HOOK: '1' },
            stdio: 'ignore',
            detached: true,
            windowsHide: true
          }).unref();
        }
      } catch (e) {}
    }

    const normModel = normalizeModelName(fallbackModel);
    let modelQuota = null;
    if (cache && cache.models) {
      if (cache.models[normModel]) {
        modelQuota = cache.models[normModel];
      } else {
        for (const k in cache.models) {
          if (normModel.includes(k) || k.includes(normModel)) {
            modelQuota = cache.models[k];
            break;
          }
        }
      }
      if (!modelQuota) {
        const families = ['claude', 'gemini', 'gpt'];
        const modelFamily = families.find(f => normModel.includes(f));
        if (modelFamily) {
          for (const k in cache.models) {
            if (k.includes(modelFamily)) {
              if (!modelQuota || cache.models[k].remaining_percentage < modelQuota.remaining_percentage) {
                modelQuota = cache.models[k];
              }
            }
          }
        }
      }
    }
    if (!modelQuota && cache && cache.models) {
      const allKeys = Object.keys(cache.models);
      if (allKeys.length > 0) {
        modelQuota = allKeys.reduce((min, k) =>
          cache.models[k].remaining_percentage < min.remaining_percentage ? cache.models[k] : min
        , cache.models[allKeys[0]]);
      }
    }
    if (!modelQuota) modelQuota = { remaining_percentage: 100, refreshes_in: '' };

    const quotaPct = modelQuota.remaining_percentage;
    const quotaColor = getColorByPercentage(quotaPct);
    const quotaVal = `${Math.round(quotaPct)}%`;
    
    const contextWindow = meta.context_window || {};
    const conversationId = meta.conversation_id || 'default';
    const ctxCachePath = join(os.homedir(), '.gemini', 'tmp', `ctx_${conversationId}.json`);
    
    let totalInput = contextWindow.total_input_tokens || 0;
    let totalOutput = contextWindow.total_output_tokens || 0;
    let usedPctNum = contextWindow.used_percentage || 0;
    const contextSize = contextWindow.context_window_size || 1048576;
    
    if (totalInput === 0 && totalOutput === 0) {
      try {
        if (existsSync(ctxCachePath)) {
          const cachedCtx = JSON.parse(readFileSync(ctxCachePath, 'utf8'));
          totalInput = cachedCtx.total_input_tokens || 0;
          totalOutput = cachedCtx.total_output_tokens || 0;
          if (cachedCtx.used_percentage) usedPctNum = cachedCtx.used_percentage;
        }
      } catch (e) {}
    } else {
      try {
        mkdirSync(join(os.homedir(), '.gemini', 'tmp'), { recursive: true });
        writeFileSync(ctxCachePath, JSON.stringify({
          total_input_tokens: totalInput,
          total_output_tokens: totalOutput,
          used_percentage: usedPctNum
        }), { encoding: 'utf8' });
      } catch (e) {}
    }
    
    if (contextSize > 0 && totalInput > 0 && !usedPctNum) {
      usedPctNum = (totalInput / contextSize) * 100;
    }
    
    const remainCtx = Math.max(0, 100 - usedPctNum);
    const contextColor = getColorByPercentage(remainCtx);
    const usedPct = `${usedPctNum.toFixed(1)}%`;
    
    const rssMem = getCliMemoryMB();
    const memUsage = `${rssMem}MB`;
    const totalTokens = totalInput;
    const tokenCount = `${formatTokens(totalTokens)} / ${formatTokens(contextSize)}`;
    const countdownVal = modelQuota.refreshes_in || (lang === 'zh-tw' ? '無' : (lang === 'jp' ? 'なし' : 'N/A'));
    const gitBranch = getGitBranch(lang);
    const projectName = basename(process.cwd());
    const projectFullPath = process.cwd();
    
    // G1 Credits
    let g1Val = '--';
    if (cache && cache.g1Credits) {
      g1Val = cache.g1Credits;
    } else {
      try {
        const oldCredPath = '/tmp/antigravity_credits.txt';
        if (existsSync(oldCredPath)) {
          g1Val = readFileSync(oldCredPath, 'utf8').trim();
        }
      } catch (e) {}
    }
    const g1Credits = g1Val;

    // RWD: 根據寬度動態決定專案路徑的精細度
    const showFullPath = termWidth >= 100;
    const projectDisp = showFullPath ? projectFullPath : projectName;
    const projectLabel = showFullPath ? '路徑' : '專案';

    // 🏆 【關鍵改變】：移除 "|" 分隔線，全面以 "雙空格" 來做精緻簡約的間距分隔，美化同時節省大量空間
    const i18n = {
      'zh-tw': {
        'model-name': `🤖 模型: ${getModelColor(fallbackModel)}${BOLD}${fallbackModel}${RESET}`,
        'quota': `🔋 額度: ${quotaColor}${quotaVal}${RESET}`,
        'context-used': `📊 Ctx: ${contextColor}${usedPct}${RESET}`,
        'memory-usage': `💾 RAM: ${memUsage}`,
        'token-count': `🔢 Tok: ${tokenCount}`,
        'quota-reset-countdown': `⏳ 重置: ${countdownVal}`,
        'git-branch': `🌿 分支: ${BOLD}${gitBranch}${RESET}`,
        'project-path': `📁 ${projectLabel}: ${BOLD}${projectDisp}${RESET}`,
        'project-full-path': `📁 路徑: ${BOLD}${projectFullPath}${RESET}`,
        'g1-credits': `💳 G1: ${BOLD}${g1Credits}${RESET}`
      },
      'us': {
        'model-name': `🤖 Model: ${getModelColor(fallbackModel)}${BOLD}${fallbackModel}${RESET}`,
        'quota': `🔋 Quota: ${quotaColor}${quotaVal}${RESET}`,
        'context-used': `📊 Ctx: ${contextColor}${usedPct}${RESET}`,
        'memory-usage': `💾 RAM: ${memUsage}`,
        'token-count': `🔢 Tok: ${tokenCount}`,
        'quota-reset-countdown': `⏳ Reset: ${countdownVal}`,
        'git-branch': `🌿 Branch: ${BOLD}${gitBranch}${RESET}`,
        'project-path': `📁 ${projectLabel === '路徑' ? 'Path' : 'Proj'}: ${BOLD}${projectDisp}${RESET}`,
        'project-full-path': `📁 Path: ${BOLD}${projectFullPath}${RESET}`,
        'g1-credits': `💳 G1: ${BOLD}${g1Credits}${RESET}`
      },
      'jp': {
        'model-name': `🤖 モデル: ${getModelColor(fallbackModel)}${BOLD}${fallbackModel}${RESET}`,
        'quota': `🔋 枠: ${quotaColor}${quotaVal}${RESET}`,
        'context-used': `📊 Ctx: ${contextColor}${usedPct}${RESET}`,
        'memory-usage': `💾 RAM: ${memUsage}`,
        'token-count': `🔢 Tok: ${tokenCount}`,
        'quota-reset-countdown': `⏳ リセット: ${countdownVal}`,
        'git-branch': `🌿 ブランチ: ${BOLD}${gitBranch}${RESET}`,
        'project-path': `📁 ${projectLabel === '路徑' ? 'パス' : 'プロジ'}: ${BOLD}${projectDisp}${RESET}`,
        'project-full-path': `📁 パス: ${BOLD}${projectFullPath}${RESET}`,
        'g1-credits': `💳 G1: ${BOLD}${g1Credits}${RESET}`
      }
    };

    const activeDict = i18n[lang] || i18n['zh-tw'];

    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < footerItems.length; i++) {
      const item = footerItems[i];
      let text = activeDict[item];
      if (!text) continue;
      
      // 當 project-full-path 與 project-path 同時啟用時，僅處理動態適應的 project-path
      if (item === 'project-full-path' && footerItems.includes('project-path')) {
        continue;
      }
      
      // 如果重置倒數為「無」系列，自動不顯示
      if (item === 'quota-reset-countdown' && (countdownVal === '無' || countdownVal === 'なし' || countdownVal === 'N/A')) {
        continue;
      }
      
      // 🏆 【關鍵改變】：改用雙空格 "  " 作為間距，拿掉生硬的 " | "，大幅節省空間
      const toAdd = currentLine === '' ? text : `  ${text}`;
      const toAddPlain = stripAnsi(toAdd);
      const currentPlain = stripAnsi(currentLine);
      
      // 智慧自適應折行
      if (currentLine !== '' && getDisplayWidth(currentPlain) + getDisplayWidth(toAddPlain) > wrapWidth) {
        lines.push(currentLine);
        currentLine = text;
      } else {
        currentLine += (currentLine === '' ? text : `  ${text}`);
      }
    }
    if (currentLine !== '') lines.push(currentLine);
    
    console.log(lines.join('\n'));

  } catch (err) {
    try {
      const projectLogDir = join(process.cwd(), '.gemini');
      if (existsSync(projectLogDir)) {
        writeFileSync(join(projectLogDir, 'hook_error.log'), `[${new Date().toISOString()}] ${err.stack || err.message}\n`, { encoding: 'utf8', flag: 'a' });
      }
    } catch (e) {}
    
    let fallbackModel = 'Gemini 3.5 Flash (High)';
    if (meta?.model?.display_name) fallbackModel = meta.model.display_name;
    else if (meta?.model?.id) fallbackModel = meta.model.id;
    console.log(`? for shortcuts | ${fallbackModel}`);
  }
  process.exit(0);
}
main();
