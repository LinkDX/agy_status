#!/usr/bin/env bash
# ==============================================================================
# install.sh - Antigravity CLI Custom Statusline 自動安裝與語系配置腳本
# ==============================================================================
# 此腳本會自動將 write_status.sh 安裝至 antigravity-cli 的配置路徑，
# 提供互動式語系選擇，並在您的 ~/.bashrc 中註冊狀態列環境變數。
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # 無顏色

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}     歡迎使用 Antigravity Statusline 安裝與配置      ${NC}"
echo -e "${BLUE}====================================================${NC}"

# 取得目前腳本所在的絕對路徑
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SRC_FILE="$DIR/write_status.sh"
TARGET_DIR="$HOME/.gemini/antigravity-cli"
TARGET_FILE="$TARGET_DIR/write_status.sh"
CONF_FILE="$TARGET_DIR/statusline.conf"
BASHRC="$HOME/.bashrc"

# 1. 檢查來源檔案是否存在
if [ ! -f "$SRC_FILE" ]; then
    echo -e "${RED}錯誤：找不到來源設定檔 $SRC_FILE！${NC}"
    exit 1
fi

# 2. 互動式語系選擇
echo -e "\n${BLUE}[步驟 1/3] 請選擇狀態列顯示語系 / Please select statusline language:${NC}"
echo -e "  1) 繁體中文 (zh-tw) [預設 / Default]"
echo -e "  2) English (en)"
read -rp "輸入選擇 (1 或 2) / Enter choice (1 or 2): " LANG_CHOICE

SELECTED_LANG="zh-tw"
if [ "$LANG_CHOICE" = "2" ]; then
    SELECTED_LANG="en"
    echo -e "${GREEN}已選擇語系：English (en)${NC}"
else
    echo -e "${GREEN}已選擇語系：繁體中文 (zh-tw)${NC}"
fi

# 3. 建立目標資料夾並複製檔案，寫入語系設定
echo -e "\n${BLUE}[步驟 2/3] 正在安裝狀態列腳本與語系設定檔...${NC}"
mkdir -p "$TARGET_DIR"
cp "$SRC_FILE" "$TARGET_FILE"
chmod +x "$TARGET_FILE"

# 寫入 statusline.conf
echo "AGY_LANG=\"$SELECTED_LANG\"" > "$CONF_FILE"

echo -e "${GREEN}✓ 狀態列腳本已成功複製至：$TARGET_FILE${NC}"
echo -e "${GREEN}✓ 語系設定已成功寫入至：$CONF_FILE${NC}"

# 4. 在 ~/.bashrc 中註冊環境變數以啟用狀態列
echo -e "\n${BLUE}[步驟 3/3] 正在設定環境變數以啟用狀態列...${NC}"
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

# 5. 安裝成功提示
echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}🎉 安裝成功！您的 Antigravity Statusline 已就緒。${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "請執行以下指令以在當前視窗立即啟用設定："
echo -e "  ${BLUE}source ~/.bashrc${NC}"
echo -e "\n接下來啟動 agy 或是 antigravity 時，即可看見您專屬的雙行狀態列！\n"
