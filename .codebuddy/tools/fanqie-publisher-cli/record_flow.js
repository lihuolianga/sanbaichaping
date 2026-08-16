const { chromium } = require("playwright");
const path = require("path");
const USER_DATA_DIR = path.join(__dirname, ".fanqie-browser-profile");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const MANAGE = "https://fanqienovel.com/main/writer/chapter-manage/7665606959365639230&" + encodeURIComponent("师父飞升后留下三百个差评") + "?type=2&from=";
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function dump(page, tag) {
  const r = await page.evaluate(() => {
    const isVis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const modals = Array.from(document.querySelectorAll(".byte-modal, .arco-modal, [role='dialog'], .byte-modal-content, .arco-modal-content")).filter(isVis).map(m => (m.textContent || "").replace(/\s+/g, "").slice(0, 150));
    const btns = [];
    const seen = new Set();
    Array.from(document.querySelectorAll("button")).forEach(b => {
      const t = (b.textContent || "").trim().replace(/\s+/g, "");
      if (t && isVis(b) && !seen.has(t)) { seen.add(t); btns.push(t); }
    });
    return { url: location.href, modals, btns };
  });
  console.log("\n========== " + tag + " ==========");
  console.log("弹窗:", JSON.stringify(r.modals, null, 1));
  console.log("按钮:", JSON.stringify(r.btns, null, 1));
  await page.screenshot({ path: path.join(__dirname, "flow_" + tag + ".png"), fullPage: true }).catch(() => {});
  return r;
}
async function clickBtn(page, exactText) {
  const b = page.locator("button").filter({ hasText: new RegExp("^" + exactText + "$") }).last();
  if (await b.count().catch(() => 0)) { await b.click({ timeout: 2000 }).catch(e => console.log("  [点击失败]", exactText, e.message)); await wait(1200); return true; }
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

  // 打开第44章编辑页
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
  console.log("编辑页URL:", editorPage.url());

  // 步骤1：编辑页初始
  await dump(editorPage, "S1_编辑页初始");

  // 步骤2：点"下一步"
  console.log("\n>>> 点[下一步]");
  await clickBtn(editorPage, "下一步");
  await dump(editorPage, "S2_点下一步后");

  // 根据出现的弹窗，逐个推进（记录每个弹窗）
  // 先看有没有"我知道了"（内容规范）
  if (await clickBtn(editorPage, "我知道了")) { console.log("  -> 点了[我知道了]"); await dump(editorPage, "S3_点我知道了后"); }
  // 看有没有"提交"（错别字）
  if (await clickBtn(editorPage, "提交")) { console.log("  -> 点了[提交]"); await dump(editorPage, "S4_点提交后"); }
  // 看有没有"仅基础检测"（内容检测）
  if (await clickBtn(editorPage, "仅基础检测")) { console.log("  -> 点了[仅基础检测]"); await dump(editorPage, "S5_点仅基础检测后"); }

  // 到达发布设置后，dump 详细内容（定时开关、日期时间、AI、按钮）
  await wait(1500);
  const detail = await editorPage.evaluate(() => {
    const isVis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const switches = Array.from(document.querySelectorAll("button[role='switch']")).map(el => ({
      checked: el.getAttribute("aria-checked"),
      near: el.parentElement ? (el.parentElement.textContent || "").replace(/\s+/g, "").slice(0, 30) : "",
    }));
    const radios = Array.from(document.querySelectorAll("label.arco-radio")).map(el => ({
      text: (el.textContent || "").trim().replace(/\s+/g, ""),
      checked: el.className.includes("checked"),
    }));
    const dateInp = document.querySelector("input[placeholder='请选择日期']");
    const timeInp = document.querySelector("input[placeholder='请选择时间']");
    return {
      switches,
      radios,
      date: dateInp ? dateInp.value : "",
      time: timeInp ? timeInp.value : "",
    };
  });
  console.log("\n========== S6_发布设置详细 ==========");
  console.log("定时/AI开关:", JSON.stringify(detail.switches, null, 1));
  console.log("AI radio:", JSON.stringify(detail.radios, null, 1));
  console.log("日期默认值:", detail.date, " 时间默认值:", detail.time);

  await ctx.close();
  console.log("\n=== 流程记录完成 ===");
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
