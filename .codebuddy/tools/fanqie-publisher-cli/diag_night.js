const { chromium } = require("playwright");
const path = require("path");
const USER_DATA_DIR = path.join(__dirname, ".fanqie-browser-profile");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const MANAGE = "https://fanqienovel.com/main/writer/chapter-manage/7665606959365639230&" + encodeURIComponent("师父飞升后留下三百个差评") + "?type=2&from=";
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
async function clickBtn(page, exactText) {
  const b = page.locator("button").filter({ hasText: new RegExp("^" + exactText + "$") }).last();
  if (await b.count().catch(() => 0)) { await b.click({ timeout: 2000 }).catch(() => {}); await wait(1000); return true; }
  return false;
}
(async () => {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, { headless: false, executablePath: EDGE, viewport: { width: 1440, height: 1000 } });
  for (const p of await ctx.pages()) await p.close().catch(() => {});
  const managePage = await ctx.newPage();
  await managePage.goto(MANAGE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await managePage.waitForTimeout(8000);

  const draftTab = managePage.locator("[role='tab']").filter({ hasText: /^草稿箱$/ }).first();
  if (await draftTab.count().catch(() => 0)) { await draftTab.click({ timeout: 2500 }).catch(() => {}); await wait(4000); }

  const row = managePage.locator("tr, [class*='table-tr']").filter({ hasText: /第60章/ }).first();
  await row.hover({ timeout: 2000 }).catch(() => {});
  await wait(500);
  await row.locator(".icon-edit").first().click({ timeout: 2500 }).catch(() => {});

  let editorPage = null;
  for (let i = 0; i < 20; i++) {
    await wait(1000);
    for (const p of await ctx.pages()) {
      if (p.url().includes("enter_from=modifydraft") && !p.isClosed()) { editorPage = p; break; }
    }
    if (editorPage) break;
  }
  if (!editorPage) { console.log("未找到编辑页"); await ctx.close(); process.exit(1); }
  await wait(3000);

  await clickBtn(editorPage, "下一步"); await wait(1500);
  await clickBtn(editorPage, "提交"); await wait(1500);
  await clickBtn(editorPage, "仅基础检测"); await wait(2500);

  // 开定时发布 + AI否 + 日期时间（复用已知逻辑）
  const allSwitches = editorPage.locator("button[role='switch'].arco-switch");
  const n = await allSwitches.count().catch(() => 0);
  for (let i = 0; i < n; i++) {
    const sw = allSwitches.nth(i);
    const near = await sw.evaluate(el => (el.parentElement ? el.parentElement.textContent : "").replace(/\s+/g, "")).catch(() => "");
    const checked = await sw.getAttribute("aria-checked").catch(() => "");
    if (near.includes("定时发布") && checked === "false") { await sw.click({ timeout: 2000 }).catch(() => {}); await wait(1500); }
  }
  const noRadio = editorPage.locator(".publish-confirm-card label.arco-radio").filter({ hasText: /^否$/ }).first();
  if (await noRadio.count().catch(() => 0)) { await noRadio.click({ timeout: 2000 }).catch(() => {}); await wait(800); }

  const dateInput = editorPage.locator("input[placeholder='请选择日期']").first();
  await dateInput.click({ timeout: 2000 }).catch(() => {});
  await wait(800);
  await editorPage.keyboard.press("Control+A"); await editorPage.keyboard.press("Backspace");
  await editorPage.keyboard.insertText("2026-08-20");
  await editorPage.keyboard.press("Enter"); await wait(1000);

  const timeInput = editorPage.locator("input[placeholder='请选择时间']").first();
  await timeInput.click({ timeout: 2000 }).catch(() => {});
  await wait(1500);
  await editorPage.locator(".arco-timepicker-list").nth(0).locator(".arco-timepicker-cell").filter({ hasText: /^20$/ }).first().click({ timeout: 2000 }).catch(() => {});
  await wait(800);
  await editorPage.locator(".arco-timepicker-list").nth(1).locator(".arco-timepicker-cell").filter({ hasText: /^00$/ }).first().click({ timeout: 2000 }).catch(() => {});
  await wait(800);
  await clickBtn(editorPage, "确定"); await wait(1000);

  // 点确认发布
  console.log("=== 点确认发布 ===");
  await clickBtn(editorPage, "确认发布");
  await wait(3000);

  // dump 完整按钮列表（看夜间提示后有什么按钮）
  const btns = await editorPage.evaluate(() => {
    const isVis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const seen = new Set();
    const out = [];
    Array.from(document.querySelectorAll("button")).forEach(b => {
      const t = (b.textContent || "").trim().replace(/\s+/g, "");
      if (t && isVis(b) && !seen.has(t)) { seen.add(t); out.push(t); }
    });
    return out;
  });
  console.log("点确认发布后的按钮:", JSON.stringify(btns));

  // 找弹窗完整文字（看是否有"我知道了"等）
  const modalText = await editorPage.evaluate(() => {
    const isVis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const m = Array.from(document.querySelectorAll(".byte-modal, .arco-modal, [role='dialog']")).filter(isVis).map(x => (x.textContent || "").replace(/\s+/g, ""));
    return m;
  });
  console.log("\n弹窗完整文字:");
  for (const t of modalText) console.log(t.slice(0, 400));

  await editorPage.screenshot({ path: path.join(__dirname, "diag_night.png"), fullPage: true });
  await ctx.close();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
