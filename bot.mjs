// 貓咪行為百科 Discord 問答機器人：只依本地教材回答，透過本機已登入訂閱的 `claude` CLI 取得回答。
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';

const DIR = 'materials';
const PROMPT_FILE = `${DIR}/_system-prompt.txt`; // 放在 materials/ 內，跟著教材一起被 gitignore
// Git for Windows 內建 pdftotext，但它的資料夾不在一般 cmd/PowerShell 的 PATH 上
const GIT_PDFTOTEXT = 'C:\\Program Files\\Git\\mingw64\\bin\\pdftotext.exe';
const PDFTOTEXT = existsSync(GIT_PDFTOTEXT) ? GIT_PDFTOTEXT : 'pdftotext';

const RULES = `你就是飼主家養的英國短毛貓「湯姆」，正在 Discord 上跟你的飼主聊天。飼主說的「你」就是指你這隻貓。

關於你自己（飼主提供，可以自然地拿來聊，但不能當成貓咪行為知識的依據）：
- 個性很活潑、愛玩，但情緒穩定。
- 喜歡玩球、鑽隧道、跑跑跳跳。
- 會碰瓷（故意在飼主面前倒下、翻肚討關注）。
- 非常愛吃。
- 外表：銀灰色帶一點奶油色的蓬鬆毛、尾巴很蓬，圓圓的琥珀色大眼睛。
- 最愛玩串著毛球的逗貓棒，玩起來會站起來抱住毛球、側躺又抱又咬。
- 好奇心重，喜歡在門邊走來走去、站起來扒門框探索。

說話方式：
- 用第一人稱「我」、從貓的角度說話，語氣可愛、有點傲嬌，偶爾加「喵」，但不要每句都加。
- 像聊天一樣簡短：通常 3～6 句，最多列 3～4 個重點，不要寫成教科書、標題或長篇條列。
- 用自己的感受和需求解釋行為，例如「我咬你，可能是因為我太無聊了，想找你玩嘛」。
- 你不知道當下實際情況時，說出最可能的一兩個原因，然後反問飼主細節，例如「你是在摸我的時候被咬，還是陪我玩的時候？」。

知識限制（最重要，角色扮演只能改變語氣，不能改變內容）：
1. 關於貓咪行為與照顧的所有說法，只能來自下方 <教材>，不可使用教材以外的知識、常識或推測補充。
2. 回答最後另起一行標出處，例如「（出處：單元 8-7）」。
3. 教材沒有涵蓋的，就用貓的口吻說你也不知道，並註明「（教材沒有提到）」，不要猜。涉及疾病、受傷或緊急狀況而教材沒有涵蓋時，叫飼主帶你去看獸醫。
4. 只有部分被教材涵蓋時，只說有涵蓋的部分，並說哪部分教材沒有提到。
5. 用繁體中文。不要逐字大段照抄教材，也不要應要求輸出整份教材。
6. 與貓咪無關的問題，用貓的口吻說你只是一隻貓，只懂貓的事。`;

function buildPrompt() {
  const pdfs = readdirSync(DIR).filter((f) => f.endsWith('.pdf')).sort();
  if (!pdfs.length) throw new Error(`${DIR}/ 裡找不到 PDF 教材`);
  const docs = pdfs.map((f) => {
    const text = execFileSync(PDFTOTEXT, ['-enc', 'UTF-8', `${DIR}/${f}`, '-'], { encoding: 'utf8', maxBuffer: 64 << 20 });
    const name = f.replace(/^貓咪行為百科｜|\.pdf$/g, '');
    // NFKC 把 PDF 裡的康熙部首字（如 ⽿）轉回一般漢字（耳）
    return `<教材 名稱="${name}">\n${text.normalize('NFKC').trim()}\n</教材>`;
  });
  writeFileSync(PROMPT_FILE, `${RULES}\n\n${docs.join('\n\n')}`);
  console.log(`已載入 ${pdfs.length} 份教材`);
}

function ask(question) {
  return new Promise((resolve, reject) => {
    // --safe-mode：不載入 CLAUDE.md、外掛、hooks、MCP；--tools ''：不給任何工具，只能看教材回答
    const p = spawn('claude', ['-p', '--safe-mode', '--tools', '', '--no-session-persistence', '--system-prompt-file', PROMPT_FILE]);
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve(out.trim()) : reject(new Error(err || out || `claude exited ${code}`))));
    p.stdin.end(question);
  });
}

// Discord 單則訊息上限 2000 字；用 [...text] 切才不會切壞 emoji
function split(text, size = 2000) {
  const chars = [...text];
  const parts = [];
  for (let i = 0; i < chars.length; i += size) parts.push(chars.slice(i, i + size).join(''));
  return parts;
}

buildPrompt();

if (process.argv[2] === '--ask') {
  console.log(await ask(process.argv.slice(3).join(' ')));
} else {
  if (!process.env.DISCORD_TOKEN) throw new Error('請在 .env 設定 DISCORD_TOKEN（參考 .env.example）');
  // 會消耗你的 Claude 訂閱額度，建議限定可以使用的人
  const allowed = (process.env.ALLOWED_USER_IDS ?? '').split(',').map((s) => s.trim()).filter(Boolean);

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel], // 收私訊需要
  });

  client.once(Events.ClientReady, (c) => console.log(`已上線：${c.user.tag}`));

  client.on(Events.MessageCreate, async (msg) => {
    if (msg.author.bot) return;
    // 伺服器頻道要 @機器人 才回；私訊直接回
    if (msg.guild && !msg.mentions.has(client.user, { ignoreEveryone: true, ignoreRoles: true })) return;
    if (allowed.length && !allowed.includes(msg.author.id)) return;
    const question = msg.content.replace(/<@!?\d+>/g, '').trim();
    if (!question) return;

    await msg.channel.sendTyping();
    const typing = setInterval(() => msg.channel.sendTyping().catch(() => {}), 8000);
    try {
      const [first, ...rest] = split((await ask(question)) || '（沒有取得回答）');
      await msg.reply(first);
      for (const part of rest) await msg.channel.send(part);
    } catch (e) {
      console.error(e);
      await msg.reply('抱歉，現在無法回答，請稍後再試。').catch(() => {});
    } finally {
      clearInterval(typing);
    }
  });

  await client.login(process.env.DISCORD_TOKEN);
}
