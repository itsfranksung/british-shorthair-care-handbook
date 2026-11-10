#!/bin/bash
# 在 Mac 上把機器人裝成 launchd 背景服務：登入後自動啟動，當掉或網路還沒好時會自動重啟。
# 重跑這個腳本 = 重新安裝並重啟。
set -euo pipefail
cd "$(dirname "$0")"

for cmd in node claude pdftotext; do
  command -v "$cmd" >/dev/null || { echo "找不到 $cmd，請先依 README 的 Mac 步驟安裝"; exit 1; }
done
[ -f .env ] || { echo "缺少 .env（參考 .env.example）"; exit 1; }
ls materials/*.pdf >/dev/null 2>&1 || { echo "materials/ 裡沒有教材 PDF"; exit 1; }
[ -d node_modules ] || npm ci

LABEL=com.tom.catbot
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
mkdir -p "$HOME/Library/LaunchAgents"
# launchd 的 PATH 只有系統路徑，所以把現在終端機的 PATH（含 Homebrew 與 claude）寫進去
cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$(command -v node)</string>
    <string>--env-file-if-exists=.env</string>
    <string>bot.mjs</string>
  </array>
  <key>WorkingDirectory</key><string>$PWD</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>$PATH</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>$PWD/bot.log</string>
  <key>StandardErrorPath</key><string>$PWD/bot.log</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "已安裝並啟動。看紀錄：tail -f \"$PWD/bot.log\""
