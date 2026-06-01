#!/usr/bin/env bash
# ==============================================================================
# install.sh - Antigravity CLI Custom Statusline 自動安裝腳本
# ==============================================================================
# 此腳本會自動將 write_status.sh 安裝至 antigravity-cli 的配置路徑，
# 並在您的 ~/.bashrc 中註冊狀態列環境變數。
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # 無顏色

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}     歡迎使用 Antigravity Statusline 安裝程式       ${NC}"
echo -e "${BLUE}====================================================${NC}"

# 取得目前腳本所在的絕對路徑
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SRC_FILE="$DIR/write_status.sh"
TARGET_DIR="$HOME/.gemini/antigravity-cli"
TARGET_FILE="$TARGET_DIR/write_status.sh"
BASHRC="$HOME/.bashrc"

# 1. 檢查來源檔案是否存在
if [ ! -f "$SRC_FILE" ]; then
    echo -e "${RED}錯誤：找不到來源設定檔 $SRC_FILE！${NC}"
    exit 1
fi

# 2. 建立目標資料夾並複製檔案
echo -e "\n${BLUE}[步驟 1/2] 正在安裝狀態列腳本...${NC}"
mkdir -p "$TARGET_DIR"
cp "$SRC_FILE" "$TARGET_FILE"
chmod +x "$TARGET_FILE"
echo -e "${GREEN}✓ 狀態列腳本已成功複製並授予執行權限：$TARGET_FILE${NC}"

# 3. 在 ~/.bashrc 中註冊環境變數以啟用狀態列
echo -e "\n${BLUE}[步驟 2/2] 正在設定環境變數以啟用狀態列...${NC}"
if [ -f "$BASHRC" ]; then
    if grep -q "CLAUDE_STATUS_LINE_COMMAND" "$BASHRC"; then
        echo -e "${YELLOW}ℹ 偵測到 $BASHRC 中已存在 CLAUDE_STATUS_LINE_COMMAND 設定，跳過寫入。${NC}"
    else
        echo -e "正在將環境變數寫入 $BASHRC..."
        echo -e "\n# Antigravity CLI Custom Statusline" >> "$BASHRC"
        echo -e "export CLAUDE_STATUS_LINE_COMMAND=\"\$HOME/.gemini/antigravity-cli/write_status.sh\"" >> "$BASHRC"
        echo -e "${GREEN}✓ 環境變數已成功寫入 $BASHRC${NC}"
    fi
else
    echo -e "${YELLOW}⚠ 找不到 $BASHRC，建立新檔案並寫入設定...${NC}"
    echo -e "# Antigravity CLI Custom Statusline" >> "$BASHRC"
    echo -e "export CLAUDE_STATUS_LINE_COMMAND=\"\$HOME/.gemini/antigravity-cli/write_status.sh\"" >> "$BASHRC"
    echo -e "${GREEN}✓ 環境變數已成功建立並寫入 $BASHRC${NC}"
fi

# 4. 安裝成功提示
echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}🎉 安裝成功！您的 Antigravity Statusline 已就緒。${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "請執行以下指令以在當前視窗立即啟用設定："
echo -e "  ${BLUE}source ~/.bashrc${NC}"
echo -e "\n接下來啟動 agy 或是 antigravity 時，即可看見您專屬的雙行狀態列！\n"
