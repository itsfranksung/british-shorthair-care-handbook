# 貓咪行為百科 Discord 問答機器人

在 Discord 跟你家的英短聊天：機器人以**貓咪本人的口吻**回答（例如問「你為什麼一直咬我？」），但內容**只依「貓咪行為百科」課程教材**並標註單元出處；教材沒提到的會直接說沒有，不會亂掰。

- 教材有著作權：PDF 放在 `materials/`，已被 `.gitignore` 排除，**永遠不會上傳到 git**。
- 回答由本機的 `claude` CLI 產生，使用你已登入的 Claude 訂閱額度（不需要 API key）。
- 機器人跑在這台電腦上；電腦關機或關掉程式，機器人就會離線。

## 需要的東西

- Node.js 22 以上
- 已登入訂閱的 Claude Code（終端機輸入 `claude` 能正常使用）
- `pdftotext`（Git for Windows 已內建）
- 教材 PDF 放在 `materials/`

## 一次性設定：建立 Discord 機器人

1. 到 <https://discord.com/developers/applications> → **New Application**。
2. 左側 **Bot** → **Reset Token** → 複製 token。
3. 同一頁往下開啟 **Message Content Intent**，然後儲存。
4. 左側 **OAuth2** → **URL Generator**：Scopes 勾 `bot`，Bot Permissions 勾 `Send Messages`、`Read Message History`，用產生的網址把機器人邀進你的伺服器。
5. 把 `.env.example` 複製成 `.env`，填入 `DISCORD_TOKEN`。建議也在 `ALLOWED_USER_IDS` 填入你自己的 Discord 使用者 ID，避免別人用掉你的額度（Discord 設定開啟「開發者模式」後，對自己按右鍵 → 複製使用者 ID）。

## 使用

```bash
npm install
npm start
```

- 伺服器頻道：`@機器人 貓咪一直半夜叫怎麼辦？`
- 也可以直接私訊機器人。

不經過 Discord、直接在終端機測試：

```bash
npm run ask -- 貓咪飛機耳是什麼意思？
```

## 部署到 Mac（開機自動執行）

> 同一個 Discord token 只能跑一隻機器人：搬到 Mac 前先把 Windows 上的 `npm start` 關掉，不然每題會回答兩次。

1. **安裝工具**（終端機）：
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   brew install node poppler
   curl -fsSL https://claude.ai/install.sh | bash
   ```
   `poppler` 提供 `pdftotext`。裝完**重開終端機**，執行一次 `claude`，用你的 Claude 訂閱帳號登入後離開。
2. **取得程式**：
   ```bash
   git clone https://github.com/itsfranksung/british-shorthair-care-handbook.git ~/cat-bot
   ```
3. **手動搬教材和設定**（不在 GitHub 上）：用 AirDrop 或隨身碟，把 Windows 上的 `materials/` 資料夾和 `.env` 複製到 `~/cat-bot/`。
4. **安裝成自動啟動**：
   ```bash
   cd ~/cat-bot && bash install-mac.sh
   ```
   之後每次登入 Mac 都會自動執行，當掉也會自己重啟。紀錄在 `~/cat-bot/bot.log`。
5. **Mac 系統設定**：
   - 「使用者與群組」→ 開啟**自動登入**：開機後要先登入，機器人才會跑起來。有開 FileVault 的話無法自動登入，重開機後要有人手動登入一次。
   - 「能源」→ 開啟**防止自動進入睡眠**和**停電後自動開機**。

常用指令：

```bash
cd ~/cat-bot && git pull && bash install-mac.sh   # 更新程式後重啟
tail -f ~/cat-bot/bot.log                          # 看紀錄
launchctl bootout gui/$(id -u)/com.tom.catbot      # 停止並取消自動啟動
```

## 限制

- 每個問題獨立回答，不記得前一句對話。
- 教材文字是從 PDF 抽取的；只存在於圖片或影片裡的內容，機器人看不到。
