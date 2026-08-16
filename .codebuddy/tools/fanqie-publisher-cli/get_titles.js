const { chromium } = require("playwright");
const path = require("path");
const USER_DATA_DIR = path.join(__dirname, ".fanqie-browser-profile");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const MANAGE = "https://fanqienovel.com/main/writer/chapter-manage/7665606959365639230&" + encodeURIComponent("师父飞升后留下三百个差评") + "?type=2&from=";
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
(async () => {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, { headless: false, executablePath: EDGE, viewport: { width: 1440, height: 1000 } });
  for (const p of await ctx.pages()) await p.close().catch(() => {});
  const page = await ctx.newPage();
  await page.goto(MANAGE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(8000);

  // 切"章节管理"tab，抓已发布+待发布章节
  const tab = page.locator("[role='tab']").filter({ hasText: /^章节管理$/ }).first();
  if (await tab.count().catch(() => 0)) { await tab.click({ timeout: 2500 }).catch(() => {}); await wait(5000); }

  const text = await page.evaluate(() => (document.body ? document.body.innerText : "").replace(/\s+/g, ""));
  // 抓所有"第N章 标题"模式
  const titles = [];
  const re = /第(\d+)章([^\d]{2,20}?)(?=\d{3,}\s*(待发布|已发布|审核中|草稿)|第\d+章|$)/g;
  let m;
  // 更简单：用已知章节号范围抓
  for (let n = 29; n <= 65; n++) {
    const idx = text.indexOf("第" + n + "章");
    if (idx >= 0) {
      const seg = text.slice(idx, idx + 40);
      const mt = seg.match(/第(\d+)章(.+?)(?=\d{3,}|待发布|已发布|审核中)/);
      if (mt) titles.push({ no: mt[1], title: mt[2] });
    }
  }
  console.log("=== 番茄侧现有章节标题（第29-65章）===");
  for (const t of titles) console.log("第" + t.no + "章 " + t.title);

  // 切草稿箱tab
  const tab2 = page.locator("[role='tab']").filter({ hasText: /^草稿箱$/ }).first();
  if (await tab2.count().catch(() => 0)) { await tab2.click({ timeout: 2500 }).catch(() => {}); await wait(4000); }
  const text2 = await page.evaluate(() => (document.body ? document.body.innerText : "").replace(/\s+/g, ""));
  const iD = text2.indexOf("草稿箱");
  console.log("\n=== 草稿箱 ===");
  console.log(text2.slice(iD, iD + 150));

  await ctx.close();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
