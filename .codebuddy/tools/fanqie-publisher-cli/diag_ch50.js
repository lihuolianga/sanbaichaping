const { chromium } = require("playwright");
const path = require("path");
const USER_DATA_DIR = path.join(__dirname, ".fanqie-browser-profile");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const MANAGE = "https://fanqienovel.com/main/writer/chapter-manage/7665606959365639230&" + encodeURIComponent("师父飞升后留下三百个差评") + "?type=2&from=";
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
(async () => {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, { headless: false, executablePath: EDGE, viewport: { width: 1440, height: 1000 } });
  // 关闭所有标签，新建干净页面
  for (const p of await ctx.pages()) await p.close().catch(() => {});
  const page = await ctx.newPage();
  await page.goto(MANAGE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(8000);

  // 切草稿箱tab
  const draftTab = page.locator("[role='tab'], [class*='tab']").filter({ hasText: /^草稿箱$/ }).first();
  if (await draftTab.count().catch(() => 0)) { await draftTab.click({ timeout: 2500 }).catch(() => {}); await wait(4000); }

  // dump 第50章行的情况
  const info = await page.evaluate(() => {
    const isVis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const rows = [];
    document.querySelectorAll("tr, [class*='table-tr']").forEach(tr => {
      const t = (tr.textContent || "").replace(/\s+/g, "");
      if (/第50章/.test(t)) {
        const r = tr.getBoundingClientRect();
        const editIcons = Array.from(tr.querySelectorAll(".icon-edit, [class*='edit']")).map(el => ({
          cls: (el.className || "").toString().slice(0, 40),
          visible: (() => { const rr = el.getBoundingClientRect(); return rr.width > 0 && rr.height > 0; })(),
        }));
        rows.push({ text: t.slice(0, 40), top: Math.round(r.top), height: Math.round(r.height), editIcons });
      }
    });
    return { rows };
  });
  console.log("=== 第50章行 ===");
  console.log(JSON.stringify(info.rows, null, 1));

  // 尝试点第50章编辑图标
  console.log("\n=== 点第50章编辑图标 ===");
  const row = page.locator("tr, [class*='table-tr']").filter({ hasText: /第50章/ }).first();
  console.log("第50章行数量:", await row.count().catch(() => 0));
  await row.hover({ timeout: 2000 }).catch(e => console.log("hover失败:", e.message));
  await wait(500);
  const editIcon = row.locator(".icon-edit").first();
  console.log("编辑图标数量:", await editIcon.count().catch(() => 0));
  await editIcon.click({ timeout: 2500 }).catch(e => console.log("点编辑失败:", e.message));
  await wait(3000);

  // 观察标签页
  const pages = await ctx.pages();
  console.log("点击后标签页数:", pages.length);
  for (const p of pages) console.log("  tab:", p.url());

  await ctx.close();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
