#!/bin/bash
# ==============================================================================
# write_status.sh - Antigravity CLI Custom Dual-Line Statusline Script
# ==============================================================================
# 1. 讀取學自 stdin 的完整 JSON 狀態並寫入暫存檔（供外部編輯器/Vim讀取）
status=$(cat)
echo "$status" > /tmp/antigravity_status

# ── 2. 獲取核心資訊 ──
model=$(echo "$status" | jq -r '.model.display_name // "Gemini 3.5"' 2>/dev/null)
remaining=$(echo "$status" | jq -r '.context_window.remaining_percentage // 100' 2>/dev/null | cut -c 1-4)
state=$(echo "$status" | jq -r '.agent_state // "idle"' 2>/dev/null)
icon=$( [ "$state" = "working" ] && echo "⚡" || echo "💤" )

# ── 3. 獲取 Git 分支 ──
cwd=$(echo "$status" | jq -r '.cwd // ""' 2>/dev/null)
[ -z "$cwd" ] || [ "$cwd" = "null" ] && cwd=$(pwd)

git_branch=""
if git -C "$cwd" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    branch=$(git -C "$cwd" symbolic-ref --short HEAD 2>/dev/null || git -C "$cwd" rev-parse --short HEAD 2>/dev/null)
    if [ -n "$branch" ]; then
        dirty=""
        if [ -n "$(git -C "$cwd" status --porcelain 2>/dev/null)" ]; then
            dirty="*"
        fi
        git_branch="($branch$dirty)"
    fi
fi

# ── 4. 獲取 Context 比例 ──
context_pct=$(echo "$status" | jq -r '.context_window.used_percentage // 0' 2>/dev/null | awk '{printf "%.0f", $1}')

# ── 5. 非同步背景獲取 G1 Credits 餘額（防止阻塞） ──
credits_cache="/tmp/antigravity_credits.txt"
credits_lock="/tmp/antigravity_credits_lock.txt"
now=$(date +%s)
needs_credits_fetch=true

if [ -f "$credits_lock" ]; then
    last_credits_call=$(cat "$credits_lock" 2>/dev/null || echo 0)
    elapsed_credits=$(( now - last_credits_call ))
    if [ "$elapsed_credits" -lt 180 ]; then
        needs_credits_fetch=false
    fi
fi

if $needs_credits_fetch; then
    echo "$now" > "$credits_lock"
    (
        res=$(/root/.gemini/antigravity-cli/bin/agentapi --print "/credits" 2>/dev/null | grep -o "G1: [0-9]*")
        if [ -n "$res" ]; then
            echo "$res" > "$credits_cache"
        fi
    ) &
fi

g1_credits=$(cat "$credits_cache" 2>/dev/null || echo "G1: 982")

# ── 6. 獲取 5 小時 Reset 剩餘時間 (優良快取自癒架構，拒絕全域狀態污染) ──
iso_to_epoch() {
    local iso_str="$1"
    local epoch
    epoch=$(date -d "${iso_str}" +%s 2>/dev/null)
    if [ -n "$epoch" ]; then
        echo "$epoch"
        return 0
    fi
    local stripped="${iso_str%%.*}"
    stripped="${stripped%%Z}"
    epoch=$(date -j -f "%Y-%m-%dT%H:%M:%S" "$stripped" +%s 2>/dev/null)
    if [ -n "$epoch" ]; then
        echo "$epoch"
        return 0
    fi
    return 1
}

format_reset_time() {
    local iso_str="$1"
    [ -z "$iso_str" ] || [ "$iso_str" = "null" ] && return
    local epoch
    epoch=$(iso_to_epoch "$iso_str")
    [ -z "$epoch" ] && return

    local now
    now=$(date +%s)
    local diff=$(( epoch - now ))

    if [ "$diff" -le 0 ]; then
        echo "已重置"
        return
    fi

    local hours=$(( diff / 3600 ))
    local mins=$(( (diff % 3600) / 60 ))

    if [ "$hours" -gt 0 ]; then
        echo "${hours}h${mins}m"
    else
        echo "${mins}m"
    fi
}

usage_cache_file="/tmp/antigravity_usage_cache.json"
api_lock_file="/tmp/antigravity_api_lock.txt"
needs_call=true

if [ -f "$api_lock_file" ]; then
    last_call=$(cat "$api_lock_file" 2>/dev/null || echo 0)
    elapsed=$(( now - last_call ))
    if [ "$elapsed" -lt 90 ]; then
        needs_call=false
    fi
fi

# 讀取現有快取資料
usage_data=""
if [ -f "$usage_cache_file" ]; then
    usage_data=$(cat "$usage_cache_file" 2>/dev/null)
fi

if $needs_call; then
    echo "$now" > "$api_lock_file"
    token="$CLAUDE_CODE_OAUTH_TOKEN"
    if [ -n "$token" ] && [ "$token" != "null" ]; then
        response=$(curl -s --max-time 3 \
            -H "Accept: application/json" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -H "anthropic-beta: oauth-2025-04-20" \
            -H "User-Agent: claude-code/2.1.34" \
            "https://api.anthropic.com/api/oauth/usage" 2>/dev/null)

        if echo "$response" | jq -e '.five_hour' >/dev/null 2>&1; then
            usage_data="$response"
            echo "$response" > "$usage_cache_file"
        fi
    fi
fi

reset_time=""
if [ -f "$usage_cache_file" ]; then
    five_hour_reset_iso=$(jq -r '.five_hour.resets_at // empty' "$usage_cache_file" 2>/dev/null)
    reset_time=$(format_reset_time "$five_hour_reset_iso")
fi

if [ -z "$reset_time" ] || [ "$reset_time" = "null" ]; then
    reset_time="待獲取"
fi

# ── 7. 顯示完整路徑 ──
display_cwd=$(echo "$cwd" | sed "s|^$HOME|~|")

# ── 8. 極致美觀雙行排版設計 ──
# 第一行：完整路徑、Git 分支、工作狀態、模型資訊
line1="📁 ${display_cwd}"
if [ -n "$git_branch" ]; then
    line1+="  🌿 ${git_branch}"
fi
line1+="  ${icon}  ${model}"

# 第二行：詳細 Context 百分比、5 小時重置倒數、G1 Credits、剩餘配額
line2="📊 Context: ${context_pct}%  │  ⟳ 5h Reset: ${reset_time}  │  💳 ${g1_credits}  │  🔋 Quota: ${remaining}%"

# 輸出雙行
printf "%s\n%s" "$line1" "$line2"
