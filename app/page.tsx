"use client";

/* eslint-disable @next/next/no-img-element -- Static export uses pre-sized local artwork. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Clock3, Heart, Home, PawPrint, ShieldCheck, Sparkles, Stethoscope, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const asset = (path: string) => `${BASE_PATH}/${path}`;
const PAGE_COUNT = 14;
const STORAGE_KEY = "british-shorthair-care-handbook-v1";

const dailyItems = [
  ["fresh-water", "替我換乾淨的水，也順手把水碗洗乾淨"],
  ["measured-food", "照獸醫與主食熱量定量餵食，不把飯碗一直補滿"],
  ["scoop-litter", "至少早晚鏟砂，看看尿塊、便便和平常是否一樣"],
  ["play", "分次陪我互動玩耍，讓不愛亂跑的英短也有運動"],
  ["quick-check", "看一下我的食慾、呼吸、眼鼻與精神"],
  ["quiet-time", "留一段不被抱、不被打擾的安靜時間給我"],
] as const;

const homeItems = [
  ["windows", "窗戶、陽台與紗窗都完成牢固防墜"],
  ["machines", "洗衣機、烘衣機門平時關好，啟動前會先檢查"],
  ["cords", "電線進硬式理線管，細繩、髮圈與塑膠袋都收好"],
  ["furniture", "電視與高櫃有防傾倒固定，家電後方縫隙已封住"],
  ["chemicals", "藥品、清潔劑、香氛與危險食物收進有鎖櫃門"],
  ["plants", "確認植物對貓安全；百合等高風險植物不進家門"],
] as const;

const recordItems = [
  ["chip", "晶片資料與寵物登記／所有權資料已確認"],
  ["vaccines", "疫苗、驅蟲與絕育安排已寫進行事曆"],
  ["clinic", "固定獸醫、夜間急診與外出籠位置已記好"],
  ["baseline", "記下目前體重、主食熱量、正常食慾與排泄樣子"],
  ["pkd", "保存父母 PKD DNA 篩檢或相關健康紀錄"],
  ["hcm", "與獸醫討論 HCM 心臟超音波評估時機"],
] as const;

const allChecklistIds = [...dailyItems, ...homeItems, ...recordItems].map(([id]) => id);
type TurnDirection = "next" | "prev";
type Stage = "intro" | "opening" | "reading";
type GuideState = { checked: string[]; firstSigned: boolean; secondSigned: boolean };
const initialGuideState: GuideState = { checked: [], firstSigned: false, secondSigned: false };

function Checklist({ items, checked, onToggle, staticMode = false }: {
  items: ReadonlyArray<readonly [string, string]>;
  checked: Set<string>;
  onToggle: (id: string) => void;
  staticMode?: boolean;
}) {
  return <div className="checklist">{items.map(([id, label]) => {
    const isChecked = checked.has(id);
    return <label className={`check-row ${isChecked ? "is-checked" : ""}`} key={id}>
      <Checkbox checked={isChecked} disabled={staticMode} onCheckedChange={() => onToggle(id)} aria-label={label} />
      <span>{label}</span>
    </label>;
  })}</div>;
}

function PageHeader({ eyebrow, title, icon }: { eyebrow: string; title: string; icon: React.ReactNode }) {
  return <header className="page-header">
    <div className="page-icon" aria-hidden="true">{icon}</div>
    <div><p className="page-eyebrow">{eyebrow}</p><h2>{title}</h2></div>
  </header>;
}

function StoryPage({ index, checked, onToggle, firstSigned, secondSigned, onSign, staticMode = false }: {
  index: number;
  checked: Set<string>;
  onToggle: (id: string) => void;
  firstSigned: boolean;
  secondSigned: boolean;
  onSign: (who: "first" | "second") => void;
  staticMode?: boolean;
}) {
  const common = { checked, onToggle, staticMode };
  return <article className={`story-page story-page-${index}`} aria-label={`第 ${index + 1} 頁`}>
    <div className="page-stitch" aria-hidden="true" />

    {index === 0 && <>
      <div className="paper-tape tape-top" aria-hidden="true" />
      <p className="formal-label">我住進來以後的第一本教學書</p>
      <h2 className="opening-title">英國短毛貓<br />養育教學書</h2>
      <div className="portrait-frame"><img src={asset("assets/our-british-shorthair-portrait.webp")} alt="你們最後養的英國短毛貓照片" /></div>
      <p className="opening-copy">我已經是你們的家人了。<br />接下來，讓我教你們把每一天照顧好。</p>
      <div className="tiny-seal"><PawPrint size={18} /> 每天照做，慢慢熟練</div>
    </>}

    {index === 1 && <>
      <PageHeader eyebrow="01｜先讀懂我，再照顧我" title="先認識我這隻英短" icon={<Heart size={22} />} />
      <div className="care-grid trait-grid">
        <div><span>毛</span><b>短、密、像絨毯</b><p>我的毛不長，但底毛很厚；每週梳理能帶走浮毛，也能順便摸摸皮膚。</p></div>
        <div><span>心</span><b>親近但有界線</b><p>我可能喜歡待在旁邊，卻不一定喜歡被抱著。四腳落地也能是很深的信任。</p></div>
        <div><span>動</span><b>穩重、活動量較低</b><p>我不是不需要玩，只是不一定自己跑起來；請用短而有趣的遊戲邀請我動。</p></div>
        <div><span>重</span><b>結實不等於肥胖</b><p>英短骨架厚實，但腰線仍要看得到、肋骨仍要摸得到，別把圓潤當成越胖越好。</p></div>
      </div>
      <p className="page-quote small">「我會用自己的方式靠近你們，<br />請先學會看懂我的舒服與不舒服。」</p>
    </>}

    {index === 2 && <>
      <PageHeader eyebrow="02｜每天照著做就不會漏" title="我的每日照顧清單" icon={<Clock3 size={22} />} />
      <Checklist items={dailyItems} {...common} />
      <div className="weekly-note">固定時間、固定流程，能讓我更安心，也更容易讓你們發現和平常不一樣的地方。</div>
    </>}

    {index === 3 && <>
      <PageHeader eyebrow="03｜英短最需要定量這件事" title="把吃飯和體重管好" icon={<Sparkles size={22} />} />
      <div className="protect-grid">
        <div><span>量</span><b>不開放任食</b><p>依主食熱量、年齡與獸醫建議秤重分餐；幼貓少量多餐，成貓可固定兩餐。</p></div>
        <div><span>換</span><b>換食慢慢來</b><p>新舊食物逐日調整；如果軟便、嘔吐或明顯不吃，先停下並詢問獸醫。</p></div>
        <div><span>秤</span><b>每週同時段量體重</b><p>用同一台秤記錄趨勢。突然變輕，或持續變重，都比單一數字更值得注意。</p></div>
        <div><span>摸</span><b>看腰線、摸肋骨</b><p>從上方應看得到腰；肋骨能輕觸摸到但不凸出。體態不確定就請獸醫示範。</p></div>
      </div>
      <div className="warning-note compact"><strong>份量沒有通用克數</strong><span>不同主食每克熱量差很多，請看 kcal，不要只照網路上的一個數字餵。</span></div>
    </>}

    {index === 4 && <>
      <PageHeader eyebrow="04｜從水碗和砂盆讀懂身體" title="喝水、尿尿、便便" icon={<Home size={22} />} />
      <div className="hero-number-grid compact-numbers">
        <div className="hero-number blue"><strong>水</strong><b>每天更新</b><span>多放幾個水點，水與食物分開一段距離；碗要寬、淺、好清洗。</span></div>
        <div className="hero-number gold"><strong>砂</strong><b>1 隻 × 2 盆</b><span>大型開放砂盆分開擺放，至少早晚鏟一次，完整換洗依砂種調整。</span></div>
        <div className="hero-number pink"><strong>看</strong><b>每天觀察</b><span>尿塊大小、次數、便便形狀和有沒有用力，都是我在告訴你們的健康訊號。</span></div>
      </div>
      <div className="urgent-note">我反覆進砂盆、用力卻尿不出來，或只滴出一點點，請當急症處理，立刻聯絡獸醫。</div>
    </>}

    {index === 5 && <>
      <PageHeader eyebrow="05｜不愛暴衝，也需要狩獵" title="陪我玩得剛剛好" icon={<Sparkles size={22} />} />
      <div className="day-clock">
        <div className="clock-ring"><Clock3 size={38} /><strong>10–15</strong><span>分鐘 × 2–3 次</span></div>
        <ol className="time-list">
          <li><b>逗貓棒走地面</b><span>模仿小獵物躲、停、再移動</span></li>
          <li><b>讓我真的抓到</b><span>遊戲結尾給我成功，不要永遠追不到</span></li>
          <li><b>把零食變任務</b><span>益智餵食器、尋寶遊戲增加腦力活動</span></li>
          <li><b>觀察喘不喘</b><span>累了就休息，不強迫跳太高或玩太久</span></li>
        </ol>
      </div>
      <div className="weekly-note">我喜歡穩固、平台夠大的跳台和抓柱。抓柱要高到能讓我把身體完整伸長。</div>
    </>}

    {index === 6 && <>
      <PageHeader eyebrow="06｜短毛也要規律整理" title="梳毛、剪甲、牙齒" icon={<Sparkles size={22} />} />
      <div className="care-grid">
        <div><span>梳</span><b>每週至少一次</b><p>用寬齒金屬梳順毛梳理；春秋換毛期增加頻率，也趁機檢查皮膚與小腫塊。</p></div>
        <div><span>甲</span><b>約每兩週檢查</b><p>只剪透明尖端；第一次先從一兩指開始，用零食讓修剪變成好事。</p></div>
        <div><span>牙</span><b>能每天刷最好</b><p>使用貓用牙膏與軟毛刷，從碰嘴、舔牙膏開始練，不使用人用牙膏。</p></div>
        <div><span>耳</span><b>看得到髒再處理</b><p>只清潔外耳可見處。臭味、紅腫、黑屑或一直甩頭，請讓獸醫檢查。</p></div>
      </div>
      <p className="page-quote small">洗澡不是固定功課；<br />梳毛、牙齒與日常觀察才是。</p>
    </>}

    {index === 7 && <>
      <PageHeader eyebrow="07｜尊重我，比一直抱我更親密" title="看懂我的身體語言" icon={<Heart size={22} />} />
      <div className="week-timeline behavior-list">
        <div><b>我主動靠近</b><p>讓我先聞手，再摸臉頰、下巴或肩背；慢眨眼也是溫柔的打招呼。</p></div>
        <div><b>尾巴甩快、耳朵向後</b><p>我可能已經受夠了。先停手、讓我離開，不要追著繼續抱。</p></div>
        <div><b>需要抱起時</b><p>一手托胸、一手托後腿，讓身體有支撐；越靠近你們身體通常越穩。</p></div>
      </div>
      <div className="warning-note compact"><strong>不噴水、不打罵</strong><span>把抓板、玩具與獎勵放在對的位置，比讓我害怕你們更有效。</span></div>
    </>}

    {index === 8 && <>
      <PageHeader eyebrow="08｜安全也能同時保護家具" title="把家電和家具守好" icon={<ShieldCheck size={22} />} />
      <Checklist items={homeItems} {...common} />
      <div className="scribble-note"><span>我想抓哪裡，就把抓板放哪裡</span>沙發旁放穩固直立抓柱，常走的地方放平面抓板；初期可加透明防抓貼。抓對時立刻稱讚我。</div>
    </>}

    {index === 9 && <>
      <PageHeader eyebrow="09｜已經買回家後的固定開銷" title="每月要替我留多少？" icon={<WalletCards size={22} />} />
      <div className="monthly-list">{[
        ["主食", "2,000–3,500"], ["貓砂", "600–1,000"], ["驅蟲／基礎保健", "300–600"],
        ["牙齒、清潔、抓板玩具", "300–700"], ["年度健檢／醫療預提", "1,000–2,000"],
      ].map(([label, price]) => <div key={label}><span>{label}</span><b>NT${price}</b></div>)}</div>
      <div className="monthly-total"><span>每月安心抓</span><strong>NT$5,000–8,000</strong></div>
      <div className="budget-total emergency-fund"><small>另外保留，不算每月花掉</small><strong>緊急醫療金 NT$50,000–100,000</strong></div>
      <p className="fine-print">實際金額會受主食、體重、地區診療與保險影響；這裡不再包含購貓費或前兩本的準備費用。</p>
    </>}

    {index === 10 && <>
      <PageHeader eyebrow="10｜英短的健康功課要做對" title="HCM 與 PKD 不一樣" icon={<Stethoscope size={22} />} />
      <div className="hcm-card"><span>HCM</span><div><strong>肥厚性心肌病</strong><p>英短可能受到影響，但目前沒有英短專用的可靠 DNA 檢測。請和獸醫討論心臟超音波；需要時由心臟專科評估。</p></div></div>
      <div className="hcm-card pkd-card"><span>PKD</span><div><strong>多囊性腎病</strong><p>英短屬需留意品種，PKD 有 DNA 檢測。請保存父母篩檢資料，並把飲水、尿量與腎臟追蹤交給固定獸醫。</p></div></div>
      <div className="law-note">每年安排健康與牙科檢查；我的體重、心音、牙齒和腎臟風險，都應有連續紀錄。</div>
    </>}

    {index === 11 && <>
      <PageHeader eyebrow="11｜我不會說話，請認得警訊" title="這些情況要找獸醫" icon={<Stethoscope size={22} />} />
      <div className="protect-grid emergency-grid">
        <div><span>急</span><b>呼吸費力或張口喘</b><p>安靜時仍呼吸急促、肚子明顯用力、牙齦顏色異常，直接急診。</p></div>
        <div><span>急</span><b>用力卻尿不出來</b><p>反覆跑砂盆、只滴幾滴、痛叫或舔尿道口，都不要等到隔天。</p></div>
        <div><span>急</span><b>倒下、抽搐或誤食</b><p>帶上可能誤食的包裝，先打給獸醫；不要自行催吐或餵人用藥。</p></div>
        <div><span>問</span><b>不吃、反覆吐瀉、沒精神</b><p>幼貓明顯不吃，或任何年齡狀況持續／惡化，當天先聯絡獸醫。</p></div>
      </div>
      <div className="urgent-note">你們最了解平常的我。只要覺得「真的不像我」，寧可先電話詢問，也不要只靠網路猜。</div>
    </>}

    {index === 12 && <>
      <PageHeader eyebrow="12｜把重要資料放在找得到的地方" title="我的健康檔案" icon={<ShieldCheck size={22} />} />
      <Checklist items={recordItems} {...common} />
      <div className="sources"><span>資料依據</span>
        <a href="https://tica.org/breed/british-shorthair/" target="_blank" rel="noreferrer">TICA：英國短毛貓</a>
        <a href="https://www.gccfcats.org/getting-a-cat/choosing/cat-breeds/british/" target="_blank" rel="noreferrer">GCCF：British</a>
        <a href="https://www.langfordvets.co.uk/diagnostic-laboratories/cat-genetic-testing/genetic-disease-and-trait-tests/polycystic-kidney-disease/" target="_blank" rel="noreferrer">Langford：PKD</a>
        <a href="https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/choosing-and-caring-your-new-cat" target="_blank" rel="noreferrer">Cornell：日常與警訊</a>
        <a href="https://animal.moa.gov.tw/Frontend/News/Detail/N0000000001529" target="_blank" rel="noreferrer">農業部：寵物登記</a>
      </div>
    </>}

    {index === 13 && <>
      <p className="formal-label">第一堂養育課完成</p>
      <h2 className="promise-title">不用一次做到完美，<br />只要每天都願意讀懂我一點。</h2>
      <img className="finish-cat" src={asset("assets/our-british-shorthair-guide.webp")} alt="你們的英國短毛貓動畫化角色" />
      <p className="promise-copy">如果你們願意替我定量吃飯、每天觀察、尊重界線，也在我需要時帶我去看醫生，就在這裡各留一枚可以取消的爪印。</p>
      <div className="signature-row">
        <button type="button" className={`signature ${firstSigned ? "signed" : ""}`} onClick={() => !staticMode && onSign("first")} disabled={staticMode} aria-pressed={firstSigned} aria-label={firstSigned ? "取消第一枚爪印" : "按下第一枚爪印"}>
          <PawPrint size={26} /><span>{firstSigned ? "第一枚已完成｜點擊取消" : "第一枚爪印"}</span>
        </button>
        <button type="button" className={`signature ${secondSigned ? "signed" : ""}`} onClick={() => !staticMode && onSign("second")} disabled={staticMode} aria-pressed={secondSigned} aria-label={secondSigned ? "取消第二枚爪印" : "按下第二枚爪印"}>
          <PawPrint size={26} /><span>{secondSigned ? "第二枚已完成｜點擊取消" : "第二枚爪印"}</span>
        </button>
      </div>
      {firstSigned && secondSigned && <div className="promise-complete"><Heart size={17} fill="currentColor" /> 好，從今天開始一起把普通的每一天照顧好。</div>}
    </>}

    <span className="page-number">{String(index + 1).padStart(2, "0")}</span>
  </article>;
}

export default function HomePage() {
  const [stage, setStage] = useState<Stage>("intro");
  const [introReply, setIntroReply] = useState(false);
  const [spreadStart, setSpreadStart] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [turning, setTurning] = useState<TurnDirection | null>(null);
  const [guideState, setGuideState] = useState<GuideState>(initialGuideState);
  const [hydrated, setHydrated] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const checked = useMemo(() => new Set(guideState.checked), [guideState.checked]);
  const completedCount = guideState.checked.filter((id) => allChecklistIds.includes(id)).length;
  const progress = Math.round((completedCount / allChecklistIds.length) * 100);
  const step = isMobile ? 1 : 2;
  const maxStart = isMobile ? PAGE_COUNT - 1 : PAGE_COUNT - 2;
  const visibleLeft = spreadStart;
  const visibleRight = isMobile ? spreadStart : spreadStart + 1;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try { const saved = window.localStorage.getItem(STORAGE_KEY); if (saved) setGuideState({ ...initialGuideState, ...JSON.parse(saved) }); }
      catch { /* Storage is optional. */ }
      finally { setHydrated(true); }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  useEffect(() => { if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(guideState)); }, [guideState, hydrated]);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSpreadStart((current) => isMobile ? Math.min(current, PAGE_COUNT - 1) : Math.min(current % 2 === 0 ? current : current - 1, PAGE_COUNT - 2));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isMobile]);

  const toggleItem = useCallback((id: string) => setGuideState((current) => ({ ...current, checked: current.checked.includes(id) ? current.checked.filter((item) => item !== id) : [...current.checked, id] })), []);
  const toggleSign = useCallback((who: "first" | "second") => setGuideState((current) => ({ ...current, ...(who === "first" ? { firstSigned: !current.firstSigned } : { secondSigned: !current.secondSigned }) })), []);
  const turnPage = useCallback((direction: TurnDirection) => {
    if (turning || stage !== "reading") return;
    const nextStart = direction === "next" ? Math.min(spreadStart + step, maxStart) : Math.max(spreadStart - step, 0);
    if (nextStart === spreadStart) return;
    setTurning(direction);
    window.setTimeout(() => { setSpreadStart(nextStart); setTurning(null); }, 680);
  }, [maxStart, spreadStart, stage, step, turning]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "ArrowRight") turnPage("next"); if (event.key === "ArrowLeft") turnPage("prev"); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [turnPage]);

  const beginReading = () => { setStage("opening"); window.setTimeout(() => setStage("reading"), 1250); };
  const pageProps = { checked, onToggle: toggleItem, firstSigned: guideState.firstSigned, secondSigned: guideState.secondSigned, onSign: toggleSign };
  const turningFront = turning === "next" ? visibleRight : visibleLeft;
  const turningBack = turning === "next" ? Math.min(spreadStart + step, PAGE_COUNT - 1) : Math.max(spreadStart - 1, 0);

  return <main className={`storybook stage-${stage}`}>
    <div className="ambient-dots" aria-hidden="true" />
    {stage !== "reading" && <section className="intro-scene" aria-label="你們的英國短毛貓邀請你們一起讀養育教學書">
      <div className={`closed-book ${stage === "opening" ? "is-opening" : ""}`}>
        <div className="book-shadow" aria-hidden="true" /><div className="inside-paper" aria-hidden="true"><PawPrint /></div>
        <div className="front-cover"><div className="cover-tape" aria-hidden="true" /><p>我們家的共同養育文件</p><h1>英國短毛貓<br />養育教學書</h1>
          <div className="cover-photo"><img src={asset("assets/our-british-shorthair-cover.webp")} alt="你們最後養的英國短毛貓封面照片" /></div>
          <span>你們 × 已經住進家的我</span><div className="cover-stamp"><PawPrint size={34} /><b>接回家後必讀</b></div>
        </div>
      </div>
      <div className={`intro-cat ${introReply ? "is-waiting" : ""}`}>
        <img src={asset("assets/our-british-shorthair-guide.webp")} alt="你們的英國短毛貓動畫化後慢慢走向書本" />
        <div className="speech-bubble" aria-live="polite"><span className="bubble-name">你們家的新成員</span>
          {introReply ? <p>好，我先陪你們看看封面。<br />想開始時，我們再一起把書翻開。</p> : <p>我真的住進你們家了。<br />要不要跟我學怎麼把我照顧好？</p>}
          <div className="intro-actions"><Button onClick={beginReading} className="read-button"><BookOpen size={18} /> 好，帶我們讀</Button>
            {!introReply && <button className="wait-button" type="button" onClick={() => setIntroReply(true)}>我們先看看封面</button>}
          </div>
        </div>
      </div>
    </section>}

    {stage === "reading" && <section className="reading-scene" aria-label="互動式英國短毛貓養育教學書">
      <header className="reading-toolbar"><div className="toolbar-title"><PawPrint size={20} /><span>英國短毛貓養育教學書</span></div>
        <div className="check-progress" aria-label={`日常清單完成 ${progress}%`}><span>{completedCount}/{allChecklistIds.length} 項完成</span><Progress value={progress} /></div>
      </header>
      <div className="book-and-guide">
        <div className={`open-book ${isMobile ? "single-page" : "two-page"}`}
          onPointerDown={(event) => { pointerStart.current = event.clientX; }}
          onPointerUp={(event) => { if (pointerStart.current === null) return; const delta = event.clientX - pointerStart.current; pointerStart.current = null; if (Math.abs(delta) >= 52) turnPage(delta > 0 ? "next" : "prev"); }}
          onPointerCancel={() => { pointerStart.current = null; }}>
          <div className="book-block" aria-hidden="true" />
          {!isMobile && <div className="book-page left-page"><StoryPage index={visibleLeft} {...pageProps} /></div>}
          <div className={`book-page ${isMobile ? "mobile-page" : "right-page"}`}><StoryPage index={visibleRight} {...pageProps} /></div>
          {turning && <div className={`turning-sheet ${turning} ${isMobile ? "mobile-sheet" : ""}`} aria-hidden="true">
            <div className="sheet-face sheet-front"><StoryPage index={turningFront} {...pageProps} staticMode /></div>
            <div className="sheet-face sheet-back"><StoryPage index={turningBack} {...pageProps} staticMode /></div>
          </div>}
          <button className="page-hotspot hotspot-prev" type="button" aria-label="翻到上一頁" disabled={spreadStart === 0 || Boolean(turning)} onClick={() => turnPage("prev")} />
          <button className="page-hotspot hotspot-next" type="button" aria-label="翻到下一頁" disabled={spreadStart >= maxStart || Boolean(turning)} onClick={() => turnPage("next")} />
        </div>
        <aside className="guide-cat" aria-label="你們的英國短毛貓導讀員"><div className="guide-bubble">
          {visibleRight < 3 && "先讀懂我的個性，再把每天的照顧變成固定習慣。"}
          {visibleRight >= 3 && visibleRight < 7 && "吃飯、體重、砂盆和梳毛，是最值得每天觀察的地方。"}
          {visibleRight >= 7 && visibleRight < 10 && "尊重我的界線，也把家電家具防護做穩，我們都會更安心。"}
          {visibleRight >= 10 && visibleRight < 13 && "健康資料要留好；覺得我不對勁時，請相信你們的觀察。"}
          {visibleRight === 13 && !(guideState.firstSigned && guideState.secondSigned) && "最後，留下兩枚隨時可以取消的爪印。"}
          {visibleRight === 13 && guideState.firstSigned && guideState.secondSigned && "好，接下來的每一天就拜託你們了。"}
        </div><img src={asset("assets/our-british-shorthair-guide.webp")} alt="你們的英國短毛貓動畫化角色站在書旁導讀" /></aside>
      </div>
      <footer className="book-controls"><Button variant="outline" onClick={() => turnPage("prev")} disabled={spreadStart === 0 || Boolean(turning)}><ArrowLeft size={18} /> 上一頁</Button>
        <div className="page-indicator" aria-live="polite"><span>{isMobile ? visibleRight + 1 : `${visibleLeft + 1}–${visibleRight + 1}`} / {PAGE_COUNT}</span><small>向右滑下一頁、向左滑上一頁，也可以用方向鍵</small></div>
        <Button onClick={() => turnPage("next")} disabled={spreadStart >= maxStart || Boolean(turning)}>下一頁 <ArrowRight size={18} /></Button>
      </footer>
    </section>}
  </main>;
}
