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
  let managePage = null;
  for (const p of await ctx.pages()) {
    if (p.url().includes("chapter-manage")) managePage = p; else await p.close().catch(() => {});
  }
  if (!managePage) managePage = await ctx.newPage();
  await managePage.goto(MANAGE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await managePage.waitForTimeout(8000);

  const row = managePage.locator("tr, [class*='table-tr']").filter({ hasText: /第44章/ }).first();
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

  await clickBtn(editorPage, "下一步");
  await wait(1500);
  await clickBtn(editorPage, "提交");
  await wait(1500);
  await clickBtn(editorPage, "仅基础检测");
  await wait(2500);

  // 开定时发布 switch
  const allSwitches = editorPage.locator("button[role='switch'].arco-switch");
  const n = await allSwitches.count().catch(() => 0);
  for (let i = 0; i < n; i++) {
    const sw = allSwitches.nth(i);
    const near = await sw.evaluate(el => (el.parentElement ? el.parentElement.textContent : "").replace(/\s+/g, "")).catch(() => "");
    const checked = await sw.getAttribute("aria-checked").catch(() => "");
    if (near.includes("定时发布") && checked === "false") { await sw.click({ timeout: 2000 }).catch(() => {}); await wait(1500); console.log("已开定时发布"); }
  }

  // AI 否
  const noRadio = editorPage.locator("label.arco-radio").filter({ hasText: /^否$/ }).first();
  if (await noRadio.count().catch(() => 0)) { await noRadio.click({ timeout: 2000 }).catch(() => {}); await wait(800); console.log("已点 AI=否"); }

  // dump 当前日期时间默认值
  const dt = await editorPage.evaluate(() => ({
    date: (document.querySelector("input[placeholder='请选择日期']") || {}).value || "",
    time: (document.querySelector("input[placeholder='请选择时间']") || {}).value || "",
  }));
  console.log("默认日期时间:", JSON.stringify(dt));

  await editorPage.screenshot({ path: path.join(__dirname, "test_auto_before.png"), fullPage: true });

  // 直接点确认发布（不碰日期时间）
  console.log("=== 直接点确认发布 ===");
  await clickBtn(editorPage, "确认发布");
  await wait(5000);

  const after = await editorPage.evaluate(() => {
    const isVis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const modals = [];
    Array.from(document.querySelectorAll(".byte-modal, .arco-modal, [role='dialog'], [class*='toast'], [class*='message']")).forEach(m => {
      if (isVis(m)) modals.push((m.textContent || "").replace(/\s+/g, "").slice(0, 150));
    });
    return { url: location.href, modals };
  });
  console.log("发布后 URL:", after.url);
  console.log("发布后弹窗:", JSON.stringify(after.modals, null, 1));

  // 验证
  await managePage.goto(MANAGE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await managePage.waitForTimeout(8000);
  const verify = await managePage.evaluate(() => {
    const text = (document.body ? document.body.innerText : "").replace(/\s+/g, "");
    const i = text.indexOf("草稿箱");
    return text.slice(i, i + 250);
  });
  console.log("\n=== 草稿箱验证 ===");
  console.log(verify);

  await ctx.close();
  console.log("\nDONE");
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
