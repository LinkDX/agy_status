# ==============================================================================
# uninstall.ps1 - Antigravity CLI Custom Statusline Windows 卸載腳本
# ==============================================================================
# 清理 Windows 環境下的狀態列檔案與環境變數。
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "====================================================" -ForegroundColor Yellow
Write-Host "       正在移除 Windows Antigravity CLI Statusline..." -ForegroundColor Yellow
Write-Host "====================================================" -ForegroundColor Yellow

$TargetDir = Join-Path $env:USERPROFILE ".gemini\antigravity-cli"
$TargetFile = Join-Path $TargetDir "write_status.js"
$ConfFile = Join-Path $TargetDir "statusline.json"

# 1. 移除檔案
Write-Host ""
Write-Host "正在移除狀態列檔案..." -ForegroundColor Cyan

if (Test-Path $TargetFile) {
    Remove-Item -Path $TargetFile -Force
    Write-Host "✓ 已刪除 write_status.js 腳本" -ForegroundColor Green
} else {
    Write-Host "ℹ 找不到狀態列腳本，跳過。" -ForegroundColor Gray
}

if (Test-Path $ConfFile) {
    Remove-Item -Path $ConfFile -Force
    Write-Host "✓ 已刪除 statusline.json 語系設定檔" -ForegroundColor Green
} else {
    Write-Host "ℹ 找不到語系設定檔，跳過。" -ForegroundColor Gray
}

# 2. 清除 Windows 使用者環境變數
Write-Host ""
Write-Host "正在清理 Windows 使用者環境變數..." -ForegroundColor Cyan

[Environment]::SetEnvironmentVariable("CLAUDE_STATUS_LINE_COMMAND", $null, "User")
Write-Host "✓ 已成功清除環境變數 CLAUDE_STATUS_LINE_COMMAND！" -ForegroundColor Green

# 3. 結束提示
Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "🎉 卸載完成！Antigravity CLI Statusline 已成功移除。" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host "請重新開啟您的終端機視窗以使環境變數生效！"
Write-Host ""
