# ==============================================================================
# install.ps1 - Antigravity CLI Custom Statusline Windows PowerShell 安裝腳本
# ==============================================================================
# 提供 Windows 平台的使用者一鍵式交互安裝與語系配置。
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "     歡迎使用 Antigravity Statusline Windows 安裝程式" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. 取得路徑
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SrcFile = Join-Path $ScriptDir "write_status.js"
$TargetDir = Join-Path $env:USERPROFILE ".gemini\antigravity-cli"
$TargetFile = Join-Path $TargetDir "write_status.js"
$ConfFile = Join-Path $TargetDir "statusline.json"

# 檢查來源檔案
if (-not (Test-Path $SrcFile)) {
    Write-Host "錯誤：找不到來源設定檔 $SrcFile！" -ForegroundColor Red
    Exit
}

# 2. 互動式語系選擇
Write-Host ""
Write-Host "[步驟 1/3] 請選擇狀態列顯示語系 / Please select statusline language:" -ForegroundColor Cyan
Write-Host "  1) 繁體中文 (zh-tw) [預設 / Default]"
Write-Host "  2) English (en)"
$Choice = Read-Host "輸入選擇 (1 或 2) / Enter choice (1 or 2)"

$SelectedLang = "zh-tw"
if ($Choice -eq "2") {
    $SelectedLang = "en"
    Write-Host "已選擇語系：English (en)" -ForegroundColor Green
} else {
    Write-Host "已選擇語系：繁體中文 (zh-tw)" -ForegroundColor Green
}

# 3. 建立目標資料夾並複製檔案
Write-Host ""
Write-Host "[步驟 2/3] 正在安裝狀態列腳本與語系設定檔..." -ForegroundColor Cyan

if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
}

Copy-Item -Path $SrcFile -Destination $TargetFile -Force

# 寫入 statusline.json
$JsonContent = "@{ lang = '$SelectedLang' }"
$JsonString = ConvertTo-Json (Invoke-Expression $JsonContent)
Set-Content -Path $ConfFile -Value $JsonString -Force

Write-Host "✓ 狀態列腳本已成功安裝至：$TargetFile" -ForegroundColor Green
Write-Host "✓ 語系設定已成功以 JSON 寫入至：$ConfFile" -ForegroundColor Green

# 4. 註冊 Windows 使用者環境變數
Write-Host ""
Write-Host "[步驟 3/3] 正在設定 Windows 環境變數以啟用狀態列..." -ForegroundColor Cyan

$EnvCmd = "node `"$env:USERPROFILE\.gemini\antigravity-cli\write_status.js`""
[Environment]::SetEnvironmentVariable("CLAUDE_STATUS_LINE_COMMAND", $EnvCmd, "User")

Write-Host "✓ 環境變數 CLAUDE_STATUS_LINE_COMMAND 已成功寫入至 Windows 使用者變數！" -ForegroundColor Green

# 5. 成功提示
Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "🎉 安裝成功！您的 Windows Antigravity Statusline 已就緒。" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host "請重新開啟您的終端機視窗（CMD 或 PowerShell），即可啟動狀態列！"
Write-Host ""
