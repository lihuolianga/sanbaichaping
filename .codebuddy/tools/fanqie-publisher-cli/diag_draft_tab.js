const { chromium } = require("playwright");
const path = require("path");
const USER_DATA_DIR = path.join(__dirname, ".fanqie-browser-profile");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const MANAGE = "https://fanqienovel.com/main/writer/chapter-manage/7665606959365639230&" + encodeURIComponent("师父飞升后留下三百个差评") + "?type=2&from=";
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
(async () => {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, { headless: false, executablePath: EDGE, viewport: { width: 1440, height: 1000 } });
  let managePage = null;
  for (const p of await ctx.pages()) {
    if (p.url().includes("chapter-manage")) managePage = p;
    else if (p.url().includes("/publish/")) await p.close().catch(() => {});
  }
  if (!managePage) managePage = await ctx.newPage();
  await managePage.goto(MANAGE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await managePage.waitForTimeout(8000);

  // dump 所有 tab
  const tabs = await managePage.evaluate(() => {
    const isVis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    return Array.from(document.querySelectorAll("[role='tab'], [class*='tab']")).filter(isVis).map(el => (el.textContent || "").trim().replace(/\s+/g, "")).filter(Boolean);
  });
  console.log("=== 可见tab ===", JSON.stringify(tabs));

  // dump 页面文字（找"草稿箱"和"第48章"）
  const text = await managePage.evaluate(() => (document.body ? document.body.innerText : "").replace(/\s+/g, ""));
  const idx = text.indexOf("草稿箱");
  console.log("\n=== 页面文字(草稿箱附近) ===");
  console.log(text.slice(Math.max(0, idx - 20), idx + 300));

  // 切到草稿箱tab
  console.log("\n=== 尝试点草稿箱tab ===");
  const draftTab = managePage.locator("[role='tab'], [class*='tab']").filter({ hasText: /草稿箱/ }).first();
  console.log("草稿箱tab数量:", await draftTab.count().catch(() => 0));
  if (await draftTab.count().catch(() => 0)) {
    await draftTab.click({ timeout: 2500 }).catch(e => console.log("点tab失败:", e.message));
    await wait(4000);
  }
  const text2 = await managePage.evaluate(() => (document.body ? document.body.innerText : "").replace(/\s+/g, ""));
  console.log("切tab后页面文字(前400):", text2.slice(0, 400));

  await managePage.screenshot({ path: path.join(__dirname, "diag_draft_tab.png"), fullPage: true });
  await ctx.close();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
