const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const USER_DATA_DIR = path.join(__dirname, ".fanqie-browser-profile");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const MANAGE = "https://fanqienovel.com/main/writer/chapter-manage/7665606959365639230&" + encodeURIComponent("师父飞飞升后留下三百个差评") + "?type=2&from=";
const MANAGE_OK = "https://fanqienovel.com/main/writer/chapter-manage/7665606959365639230&" + encodeURIComponent("师父飞升后留下三百个差评") + "?type=2&from=";
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
async function clickBtn(page, exactText) {
  const b = page.locator("button").filter({ hasText: new RegExp("^" + exactText + "$") }).last();
  if (await b.count().catch(() => 0)) { await b.click({ timeout: 2000 }).catch(() => {}); await wait(1000); return true; }
  return false;
}
(async () => {
  // 读正确正文（去掉第一行标题）
  const ch = fs.readFileSync(path.join(__dirname, "chapters", "089-第89章 槐荫村地下灵根巢的出口.txt"), "utf8").trim();
  const lines = ch.split(/\r?\n/);
  const body = lines.slice(1).join("\n").trim();
  console.log("正确正文长度:", body.length);

  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, { headless: false, executablePath: EDGE, viewport: { width: 1440, height: 1000 } });
  for (const p of await ctx.pages()) await p.close().catch(() => {});
  const managePage = await ctx.newPage();
  await managePage.goto(MANAGE_OK, { waitUntil: "domcontentloaded", timeout: 30000 });
  await managePage.waitForTimeout(8000);
  const draftTab = managePage.locator("[role='tab'], [class*='tab']").filter({ hasText: /^草稿箱$/ }).first();
  if (await draftTab.count().catch(() => 0)) { await draftTab.click({ timeout: 2500 }).catch(() => {}); await wait(4000); }
  const row = managePage.locator("tr, [class*='table-tr']").filter({ hasText: /第89章/ }).first();
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
  await wait(4000);

  // 重填正文
  const editor = editorPage.locator(".ProseMirror[contenteditable='true']").first();
  await editor.click({ timeout: 3000 }).catch(() => {});
  await editorPage.keyboard.press("Control+A");
  await editorPage.keyboard.press("Backspace");
  await editorPage.keyboard.insertText(body);
  await wait(2000);
  const len = await editor.evaluate(el => (el.textContent || "").length).catch(() => -1);
  console.log("重填后正文长度:", len);

  // 存草稿
  await clickBtn(editorPage, "存草稿");
  await wait(4000);
  console.log("已点存草稿");
  await ctx.close();
  console.log("DONE");
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
