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

  // 点第44章编辑
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
  console.log("编辑页:", editorPage.url());

  await clickBtn(editorPage, "下一步"); await wait(1500);
  await clickBtn(editorPage, "提交"); await wait(1500);
  await clickBtn(editorPage, "仅基础检测"); await wait(3000);

  // 开定时发布
  const allSwitches = editorPage.locator("button[role='switch'].arco-switch");
  const n = await allSwitches.count().catch(() => 0);
  for (let i = 0; i < n; i++) {
    const sw = allSwitches.nth(i);
    const near = await sw.evaluate(el => (el.parentElement ? el.parentElement.textContent : "").replace(/\s+/g, "")).catch(() => "");
    const checked = await sw.getAttribute("aria-checked").catch(() => "");
    if (near.includes("定时发布") && checked === "false") { await sw.click({ timeout: 2000 }).catch(() => {}); await wait(1500); console.log("已开定时发布"); }
  }
  // AI 否
  const noRadio = editorPage.locator(".publish-confirm-card label.arco-radio").filter({ hasText: /^否$/ }).first();
  if (await noRadio.count().catch(() => 0)) { await noRadio.click({ timeout: 2000 }).catch(() => {}); await wait(800); }

  // 日期键盘输入
  const dateInput = editorPage.locator("input[placeholder='请选择日期']").first();
  await dateInput.click({ timeout: 2000 }).catch(() => {});
  await wait(800);
  await editorPage.keyboard.press("Control+A"); await editorPage.keyboard.press("Backspace");
  await editorPage.keyboard.insertText("2026-08-15");
  await editorPage.keyboard.press("Enter"); await wait(1000);

  // 时间点小时+分钟+确定
  const timeInput = editorPage.locator("input[placeholder='请选择时间']").first();
  await timeInput.click({ timeout: 2000 }).catch(() => {});
  await wait(1500);
  await editorPage.locator(".arco-timepicker-list").nth(0).locator(".arco-timepicker-cell").filter({ hasText: /^16$/ }).first().click({ timeout: 2000 }).catch(() => {});
  await wait(800);
  await editorPage.locator(".arco-timepicker-list").nth(1).locator(".arco-timepicker-cell").filter({ hasText: /^00$/ }).first().click({ timeout: 2000 }).catch(() => {});
  await wait(800);
  await clickBtn(editorPage, "确定"); await wait(1000);
  console.log("日期:", await dateInput.inputValue().catch(() => "?"), "时间:", await timeInput.inputValue().catch(() => "?"));

  // 点确认发布（精确弹窗内按钮）
  console.log("=== 点确认发布 ===");
  await editorPage.locator(".publish-confirm-card button").filter({ hasText: /确认发布/ }).first().click({ timeout: 2500 }).catch(e => console.log("点击失败:", e.message));
  console.log("已点确认发布，开始观察...");

  for (const sec of [2, 5, 10, 15, 25]) {
    await wait((sec === 2 ? 2 : sec - [2, 5, 10, 15, 25][[2, 5, 10, 15, 25].indexOf(sec) - 1]) * 1000);
    const st = await editorPage.evaluate(() => {
      const isVis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const modals = Array.from(document.querySelectorAll(".byte-modal, .arco-modal, [role='dialog'], [class*='toast'], [class*='message'], [class*='notification']")).filter(isVis).map(m => (m.textContent || "").replace(/\s+/g, "").slice(0, 100));
      const text = (document.body ? document.body.innerText : "").replace(/\s+/g, "");
      return { url: location.href, modals, hasSuccess: /发布成功|已发布|定时发布成功|审核中/.test(text) };
    }).catch(() => ({ url: "?", modals: [], hasSuccess: false }));
    console.log(`[${sec}s] url=${st.url} success=${st.hasSuccess} modals=${JSON.stringify(st.modals)}`);
    if (sec === 10) await editorPage.screenshot({ path: path.join(__dirname, "watch_10s.png"), fullPage: true });
  }

  // 回章节管理验证
  await managePage.goto(MANAGE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await managePage.waitForTimeout(8000);
  const verify = await managePage.evaluate(() => {
    const text = (document.body ? document.body.innerText : "").replace(/\s+/g, "");
    const i = text.indexOf("草稿箱");
    return text.slice(i, i + 200);
  });
  console.log("\n草稿箱:", verify);
  await ctx.close();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
