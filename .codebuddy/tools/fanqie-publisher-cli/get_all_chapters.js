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

  // 滚动加载所有章节（可能有分页，尝试翻页）
  const allRows = [];
  for (let pageNo = 0; pageNo < 10; pageNo++) {
    // 抓当前页的章节行
    const rows = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll("tr, [class*='table-tr']").forEach(tr => {
        const t = (tr.textContent || "").replace(/\s+/g, "");
        const m = t.match(/第(\d+)章(.+?)(\d{3,})\s*(待发布|已发布|审核中|草稿)?/);
        if (m) {
          out.push({ no: m[1], title: m[2], chars: m[3], status: m[4] || "" });
        }
      });
      return out;
    });
    for (const r of rows) {
      if (!allRows.some(x => x.no === r.no && x.title === r.title)) {
        allRows.push(r);
      }
    }
    // 尝试翻页（下一页）
    const next = page.locator("[class*='pagination-next'], button").filter({ hasText: /下一页|›|»/ }).first();
    const nextDisabled = await page.locator("[class*='pagination-disabled']").count().catch(() => 0);
    if (await next.count().catch(() => 0) && nextDisabled === 0) {
      await next.click({ timeout: 2000 }).catch(() => {});
      await wait(2500);
    } else {
      break;
    }
  }

  // 按章节号排序输出
  allRows.sort((a, b) => Number(a.no) - Number(b.no));
  console.log("=== 番茄侧所有章节（共" + allRows.length + "章）===");
  for (const r of allRows) {
    console.log(`第${r.no}章 ${r.title} [${r.status}]`);
  }

  // 切到草稿箱
  const tab2 = page.locator("[role='tab'], [class*='tab']").filter({ hasText: /^草稿箱$/ }).first();
  if (await tab2.count().catch(() => 0)) { await tab2.click({ timeout: 2500 }).catch(() => {}); await wait(4000); }
  else { await page.locator("text=草稿箱").first().click({ timeout: 2500 }).catch(() => {}); await wait(4000); }
  const drafts = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("tr, [class*='table-tr']").forEach(tr => {
      const t = (tr.textContent || "").replace(/\s+/g, "");
      const m = t.match(/第(\d+)章(.+?)(\d{3,})/);
      if (m) out.push({ no: m[1], title: m[2], chars: m[3] });
    });
    return out;
  });
  drafts.sort((a, b) => Number(a.no) - Number(b.no));
  console.log("\n=== 草稿箱章节 ===");
  for (const d of drafts) console.log(`第${d.no}章 ${d.title}`);

  await ctx.close();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
