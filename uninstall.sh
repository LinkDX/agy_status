#!/usr/bin/env bash
# ==============================================================================
# uninstall.sh - Antigravity CLI Custom Statusline 卸載與清理腳本 (Node.js Edition)
# ==============================================================================
# 此腳本會安全地移除 write_status.js 與 statusline.json，並清理 ~/.bashrc 中的環境變數設定。
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # 無顏色

echo -e "${YELLOW}====================================================${NC}"
echo -e "${YELLOW}       正在移除 Antigravity CLI Statusline...       ${NC}"
echo -e "${YELLOW}====================================================${NC}"

TARGET_FILE="$HOME/.gemini/antigravity-cli/write_status.js"
CONF_FILE="$HOME/.gemini/antigravity-cli/statusline.json"
BASHRC="$HOME/.bashrc"

# 1. 移除目標腳本與設定檔
if [ -f "$TARGET_FILE" ]; then
    echo -e "正在移除 $TARGET_FILE..."
    rm "$TARGET_FILE"
    echo -e "${GREEN}✓ 已刪除 write_status.js 腳本${NC}"
else
    echo -e "ℹ 找不到 $TARGET_FILE，跳過此步驟。"
fi

if [ -f "$CONF_FILE" ]; then
    echo -e "正在移除語系設定檔 $CONF_FILE..."
    rm "$CONF_FILE"
    echo -e "${GREEN}✓ 已刪除 statusline.json 語系設定檔${NC}"
else
    echo -e "ℹ 找不到 $CONF_FILE，跳過此步驟。"
fi

# 2. 清理 .bashrc 中的啟動環境變數 (支援舊版與新版 node 格式的清理)
if [ -f "$BASHRC" ]; then
    echo -e "正在從 $BASHRC 中清理環境變數代碼..."
    
    TEMP_BASHRC=$(mktemp)
    
    # 支援移除 node 或 shell 版本的設定行
    perl -0777 -pe 's/\n# Antigravity CLI Custom Statusline\nexport CLAUDE_STATUS_LINE_COMMAND="node \$HOME\/\.gemini\/antigravity-cli\/write_status\.js"//g' "$BASHRC" | \
    perl -0777 -pe 's/\n# Antigravity CLI Custom Statusline\nexport CLAUDE_STATUS_LINE_COMMAND="\$HOME\/\.gemini\/antigravity-cli\/write_status\.sh"//g' > "$TEMP_BASHRC"
    
    # 回寫到 .bashrc
    mv "$TEMP_BASHRC" "$BASHRC"
    
    echo -e "${GREEN}✓ 已成功從 $BASHRC 清理狀態列環境變數。${NC}"
else
    echo -e "ℹ 找不到 ~/.bashrc，無需清理。"
fi

echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}🎉 卸載完成！Antigravity CLI Statusline 已成功移除。${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "請在當前視窗執行以下指令以重新整理環境變數："
echo -e "  ${BLUE}unset CLAUDE_STATUS_LINE_COMMAND${NC}\n"
