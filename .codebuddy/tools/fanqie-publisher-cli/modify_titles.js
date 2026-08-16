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

const changes = [
  { no: "44", newTitle: "让她知道外面有人等" },
  { no: "46", newTitle: "十二个名字归位" },
];

(async () => {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, { headless: false, executablePath: EDGE, viewport: { width: 1440, height: 1000 } });

  for (const c of changes) {
    console.log(`\n===== 修改第${c.no}章标题 -> ${c.newTitle} =====`);
    // 清理残留编辑页
    let managePage = null;
    for (const p of await ctx.pages()) {
      if (p.url().includes("chapter-manage")) managePage = p;
      else if (p.url().includes("/publish/")) await p.close().catch(() => {});
    }
    if (!managePage) managePage = await ctx.newPage();
    await managePage.goto(MANAGE, { waitUntil: "domcontentloaded", timeout: 30000 });
    await managePage.waitForTimeout(8000);

    // 点该章编辑图标
    const row = managePage.locator("tr, [class*='table-tr']").filter({ hasText: new RegExp("第" + c.no + "章") }).first();
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
    if (!editorPage) { console.log("未找到编辑页"); continue; }
    await wait(3000);

    // 读当前标题
    const titleSel = editorPage.locator("input.serial-input.serial-editor-input-hint-area.byte-input.byte-input-size-default").first();
    const oldTitle = await titleSel.inputValue().catch(() => "(读取失败)");
    console.log("当前标题:", oldTitle);

    // 改标题：键盘输入 + 回读校验
    let ok = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      await titleSel.click({ timeout: 2000 }).catch(() => {});
      await editorPage.keyboard.press("Control+A");
      await editorPage.keyboard.press("Backspace");
      await editorPage.keyboard.insertText(c.newTitle);
      await wait(1000);
      const v = await titleSel.inputValue().catch(() => "");
      if (v === c.newTitle) { ok = true; break; }
      console.log(`  第${attempt + 1}次标题未生效(="${v}")，重试`);
    }
    if (!ok) { console.log("标题修改失败"); await editorPage.close().catch(() => {}); continue; }
    console.log("新标题已填:", c.newTitle);

    // 存草稿
    await clickBtn(editorPage, "存草稿");
    await wait(4000);
    console.log("已点存草稿");
    await editorPage.close().catch(() => {});
  }

  // 验证草稿箱标题
  await wait(2000);
  const page = ctx.pages().find(p => p.url().includes("chapter-manage")) || await ctx.newPage();
  await page.goto(MANAGE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(8000);
  const drafts = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("tr, [class*='table-tr']").forEach(tr => {
      const t = (tr.textContent || "").replace(/\s+/g, "");
      const m = t.match(/第(\d+)章(.+?)(\d{3,})/);
      if (m) out.push({ no: m[1], title: m[2] });
    });
    return out;
  });
  drafts.sort((a, b) => Number(a.no) - Number(b.no));
  console.log("\n===== 草稿箱最终标题 =====");
  for (const d of drafts) console.log(`第${d.no}章 ${d.title}`);

  await ctx.close();
  console.log("\nDONE");
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
