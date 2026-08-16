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
  const text = await page.evaluate(() => (document.body ? document.body.innerText : "").replace(/\s+/g, ""));
  const i = text.indexOf("草稿箱");
  console.log("=== 草稿箱 ===");
  console.log(text.slice(i, i + 200));
  await ctx.close();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
