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

// 参数：章节号 日期 小时 分钟
const chapterNo = process.argv[2] || "44";
const dateStr = process.argv[3] || "2026-08-15";
const hour = process.argv[4] || "16";
const minute = process.argv[5] || "00";
// 标题覆盖表：用于标题与番茄侧已发布章节重复、需要按内容改名的章节
const TITLE_OVERRIDES = { "79": "三份证词都是真话" };
const newTitle = TITLE_OVERRIDES[chapterNo] || "";

(async () => {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, { headless: false, executablePath: EDGE, viewport: { width: 1440, height: 1000 } });
  // 关闭所有残留标签，新建干净页面
  for (const p of await ctx.pages()) await p.close().catch(() => {});
  const managePage = await ctx.newPage();
  await managePage.goto(MANAGE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await managePage.waitForTimeout(8000);

  // 先切到"草稿箱"tab
  const draftTab = managePage.locator("[role='tab'], [class*='tab']").filter({ hasText: /^草稿箱$/ }).first();
  if (await draftTab.count().catch(() => 0)) { await draftTab.click({ timeout: 2500 }).catch(() => {}); await wait(4000); }
  else { await managePage.locator("text=草稿箱").first().click({ timeout: 2500 }).catch(() => {}); await wait(4000); }

  // 点第N章编辑
  const row = managePage.locator("tr, [class*='table-tr']").filter({ hasText: new RegExp("第" + chapterNo + "章") }).first();
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
  const cur = await editorPage.evaluate(() => ({
    no: (document.querySelector("input.serial-input.byte-input.byte-input-size-default") || {}).value || "",
    title: (document.querySelector("input.serial-input.serial-editor-input-hint-area") || {}).value || "",
  }));
  console.log(`第${chapterNo}章: 章节号=${cur.no} 标题=${cur.title}，定时到 ${dateStr} ${hour}:${minute}`);

  // 若需要修改标题（标题与番茄侧重复时）
  if (newTitle && newTitle !== cur.title) {
    const titleSel = editorPage.locator("input.serial-input.serial-editor-input-hint-area.byte-input.byte-input-size-default").first();
    if (await titleSel.count().catch(() => 0)) {
      await titleSel.click({ timeout: 2000 }).catch(() => {});
      await editorPage.keyboard.press("Control+A");
      await editorPage.keyboard.press("Backspace");
      await editorPage.keyboard.insertText(newTitle);
      await wait(1500);
      const v = await titleSel.inputValue().catch(() => "");
      console.log("标题覆盖:", v === newTitle ? "OK=" + newTitle : "未生效(当前=" + v + ")");
    }
  }

  // 流程：下一步 → 提交(错别字) → 仅基础检测
  await clickBtn(editorPage, "下一步"); await wait(1500);
  await clickBtn(editorPage, "提交"); await wait(1500);
  await clickBtn(editorPage, "仅基础检测"); await wait(2500);

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
  const noRadio = editorPage.locator(".publish-confirm-card label.arco-radio").filter({ hasText: /^否$/ }).first();
  if (await noRadio.count().catch(() => 0)) { await noRadio.click({ timeout: 2000 }).catch(() => {}); await wait(800); console.log("已选 AI=否"); }

  // 日期键盘输入
  const dateInput = editorPage.locator("input[placeholder='请选择日期']").first();
  await dateInput.click({ timeout: 2000 }).catch(() => {});
  await wait(800);
  await editorPage.keyboard.press("Control+A"); await editorPage.keyboard.press("Backspace");
  await editorPage.keyboard.insertText(dateStr);
  await editorPage.keyboard.press("Enter"); await wait(1000);
  console.log("日期:", await dateInput.inputValue().catch(() => "?"));

  // 时间：点小时列+分钟列+确定
  const timeInput = editorPage.locator("input[placeholder='请选择时间']").first();
  await timeInput.click({ timeout: 2000 }).catch(() => {});
  await wait(1500);
  await editorPage.locator(".arco-timepicker-list").nth(0).locator(".arco-timepicker-cell").filter({ hasText: new RegExp("^" + hour + "$") }).first().click({ timeout: 2000 }).catch(() => {});
  await wait(800);
  await editorPage.locator(".arco-timepicker-list").nth(1).locator(".arco-timepicker-cell").filter({ hasText: new RegExp("^" + minute + "$") }).first().click({ timeout: 2000 }).catch(() => {});
  await wait(800);
  // 在时间面板容器内点"确定"按钮关闭面板（避免匹配到其他隐藏按钮）
  const okBtn = editorPage.locator("[class*='timepicker-container'], [class*='picker-popup'], [class*='timepicker-footer']").locator("button").filter({ hasText: /确定/ }).last();
  if (await okBtn.count().catch(() => 0)) { await okBtn.click({ timeout: 2000 }).catch(() => {}); }
  else { await clickBtn(editorPage, "确定"); }
  await wait(1200);
  console.log("时间:", await timeInput.inputValue().catch(() => "?"));

  // 检查面板是否关闭
  const panelOpen = await editorPage.evaluate(() => {
    const isVis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    return Array.from(document.querySelectorAll("[class*='picker-panel'], [class*='picker-container'], [class*='picker-popup']")).filter(isVis).length;
  });
  console.log("面板数:", panelOpen);

  await editorPage.screenshot({ path: path.join(__dirname, "sched_before.png"), fullPage: true });

  // 点确认发布（滚动到可见再点）
  console.log("=== 点确认发布 ===");
  const confirmBtn = editorPage.locator("button").filter({ hasText: /确认发布/ }).last();
  if (await confirmBtn.count().catch(() => 0)) {
    await confirmBtn.scrollIntoViewIfNeeded().catch(() => {});
    await wait(800);
    await confirmBtn.click({ timeout: 3000 }).catch(() => {});
  } else {
    await clickBtn(editorPage, "确认发布");
  }
  await wait(6000);

  // 若仍停留在发布设置页，处理可能的二次确认弹窗（"确认发布"是 BUTTON，在 .arco-modal-footer）
  if (editorPage.url().includes("modifydraft")) {
    await editorPage.screenshot({ path: path.join(__dirname, "sched_confirm_retry.png"), fullPage: true });
    const realBtn = editorPage.locator(".arco-modal-footer button.arco-btn-primary").last();
    const btnInfo = await realBtn.evaluate(el => ({ disabled: el.disabled, text: el.textContent.trim(), cls: el.className })).catch(() => null);
    console.log("弹窗确认按钮:", JSON.stringify(btnInfo));
    if (await realBtn.count().catch(() => 0)) {
      await realBtn.scrollIntoViewIfNeeded().catch(() => {});
      await wait(500);
      await realBtn.click({ force: true, timeout: 5000 }).catch(e => console.log("click err:", e.message));
      console.log("已点击弹窗内'确认发布'BUTTON(Playwright原生)");
    }
    await wait(10000);
  }

  const after = await editorPage.evaluate(() => {
    const isVis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const modals = Array.from(document.querySelectorAll(".byte-modal, .arco-modal, [role='dialog'], [class*='toast'], [class*='message']")).filter(isVis).map(m => (m.textContent || "").replace(/\s+/g, "").slice(0, 120));
    const text = (document.body ? document.body.innerText : "").replace(/\s+/g, "");
    return { url: location.href, modals, hasSuccess: /发布成功|已发布|定时发布成功|审核中/.test(text), hasDup: /重复标题|重复/.test(text) };
  });
  console.log("发布后 URL:", after.url);
  console.log("弹窗:", JSON.stringify(after.modals, null, 1));
  console.log("成功标志:", after.hasSuccess, " 重复提示:", after.hasDup);
  await editorPage.screenshot({ path: path.join(__dirname, "sched_after.png"), fullPage: true });

  // 验证草稿箱/章节管理
  await managePage.goto(MANAGE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await managePage.waitForTimeout(8000);
  const verify = await managePage.evaluate(() => {
    const text = (document.body ? document.body.innerText : "").replace(/\s+/g, "");
    const i = text.indexOf("草稿箱");
    return text.slice(i, i + 200);
  });
  console.log("\n草稿箱:", verify);

  await ctx.close();
  console.log("\nDONE");
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
