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

  // 只走：下一步 → 提交 → 仅基础检测，然后观察
  await clickBtn(editorPage, "下一步"); await wait(1500);
  await clickBtn(editorPage, "提交"); await wait(1500);
  await clickBtn(editorPage, "仅基础检测");
  console.log("已点'仅基础检测'，等待15秒观察...");
  await wait(15000);

  // dump 当前状态
  const state = await editorPage.evaluate(() => {
    const isVis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const modals = Array.from(document.querySelectorAll(".byte-modal, .arco-modal, [role='dialog'], [class*='toast'], [class*='message']")).filter(isVis).map(m => (m.textContent || "").replace(/\s+/g, "").slice(0, 150));
    const text = (document.body ? document.body.innerText : "").replace(/\s+/g, "");
    return { modals, head: text.slice(0, 300), hasDraft: /草稿/.test(text), hasPublish: /发布成功|已发布|定时发布成功|审核中/.test(text) };
  });
  console.log("15秒后弹窗:", JSON.stringify(state.modals, null, 1));
  console.log("页面头部:", state.head);
  console.log("发布标志:", state.hasPublish);

  // 检查草稿箱
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
