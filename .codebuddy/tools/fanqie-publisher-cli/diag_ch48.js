const { chromium } = require("playwright");
const path = require("path");
const USER_DATA_DIR = path.join(__dirname, ".fanqie-browser-profile");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const MANAGE = "https://fanqienovel.com/main/writer/chapter-manage/7665606959365639230&" + encodeURIComponent("师父飞升后留下三百个差评") + "?type=2&from=";
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
(async () => {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, { headless: false, executablePath: EDGE, viewport: { width: 1440, height: 1000 } });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto(MANAGE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(8000);

  // 切到"章节管理"tab
  const tab = page.locator("[role='tab'], [class*='tab']").filter({ hasText: /^章节管理$/ }).first();
  if (await tab.count().catch(() => 0)) { await tab.click({ timeout: 2500 }).catch(() => {}); await wait(4000); }
  else { await page.locator("text=章节管理").first().click({ timeout: 2500 }).catch(() => {}); await wait(4000); }

  const text = await page.evaluate(() => (document.body ? document.body.innerText : "").replace(/\s+/g, ""));
  // 找第48章附近
  const idx = text.indexOf("第48章");
  console.log("第48章在章节管理tab的上下文:", idx >= 0 ? text.slice(Math.max(0, idx - 30), idx + 80) : "(未找到第48章)");

  // 找第47章和49章，确认第48章是否缺失
  const idx47 = text.indexOf("第47章");
  const idx49 = text.indexOf("第49章");
  console.log("\n第47章上下文:", idx47 >= 0 ? text.slice(idx47, idx47 + 60) : "(无)");
  console.log("第49章上下文:", idx49 >= 0 ? text.slice(idx49, idx49 + 60) : "(无)");

  await page.screenshot({ path: path.join(__dirname, "diag_ch48.png"), fullPage: true });
  await ctx.close();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
