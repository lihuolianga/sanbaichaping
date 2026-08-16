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

  // 切"章节管理"tab
  const tab = page.locator("[role='tab']").filter({ hasText: /^章节管理$/ }).first();
  if (await tab.count().catch(() => 0)) { await tab.click({ timeout: 2500 }).catch(() => {}); await wait(5000); }

  const text = await page.evaluate(() => (document.body ? document.body.innerText : "").replace(/\s+/g, ""));
  // 找第48-56章的上下文
  console.log("=== 章节管理tab：第48-56章状态 ===");
  for (const n of [48, 49, 50, 51, 52, 53, 54, 55, 56]) {
    const idx = text.indexOf("第" + n + "章");
    if (idx >= 0) {
      console.log(text.slice(idx, idx + 45));
    } else {
      console.log("第" + n + "章: (未在章节管理tab找到)");
    }
  }

  // 切草稿箱tab
  const tab2 = page.locator("[role='tab']").filter({ hasText: /^草稿箱$/ }).first();
  if (await tab2.count().catch(() => 0)) { await tab2.click({ timeout: 2500 }).catch(() => {}); await wait(5000); }
  const text2 = await page.evaluate(() => (document.body ? document.body.innerText : "").replace(/\s+/g, ""));
  const iDraft = text2.indexOf("草稿箱");
  console.log("\n=== 草稿箱tab ===");
  console.log(text2.slice(iDraft, iDraft + 250));

  await ctx.close();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
