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

  // dump tab 精确信息
  const tabs = await page.evaluate(() => {
    const isVis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    return Array.from(document.querySelectorAll("[role='tab']")).filter(isVis).map(el => ({
      text: (el.textContent || "").trim().replace(/\s+/g, ""),
      cls: (el.className || "").toString().slice(0, 60),
      aria: el.getAttribute("aria-selected"),
    }));
  });
  console.log("=== role=tab 元素 ===");
  for (const t of tabs) console.log(JSON.stringify(t));

  // 页面文字搜索第50章
  const text = await page.evaluate(() => (document.body ? document.body.innerText : "").replace(/\s+/g, ""));
  console.log("\n页面文字含'第50章':", text.includes("第50章"));
  const i50 = text.indexOf("第50章");
  if (i50 >= 0) console.log("第50章上下文:", text.slice(Math.max(0, i50 - 20), i50 + 60));

  // 页面文字含"草稿箱"上下文
  const iDraft = text.indexOf("草稿箱");
  console.log("\n草稿箱上下文:", text.slice(Math.max(0, iDraft - 10), iDraft + 80));

  await page.screenshot({ path: path.join(__dirname, "diag_tab2.png"), fullPage: true });
  await ctx.close();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
