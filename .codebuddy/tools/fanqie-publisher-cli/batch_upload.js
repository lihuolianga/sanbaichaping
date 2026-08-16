const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const TOOL = __dirname;
const USER_DATA_DIR = path.join(TOOL, ".fanqie-browser-profile");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const CHAPTERS_DIR = path.join(TOOL, "chapters");
const LOG = path.join(TOOL, "batch_log.txt");
const BOOK_ID = "7665606959365639230";
const BOOK_NAME = encodeURIComponent("师父飞升后留下三百个差评");
const MANAGE = `https://fanqienovel.com/main/writer/chapter-manage/${BOOK_ID}&${BOOK_NAME}?type=2&from=`;

const argv = process.argv.slice(2);
const start = Number(argv[0] || 40);
const end = Number(argv[1] || 47);
const intervalSec = Number(argv[2] || 60);

function log(msg) {
  const line = "[" + new Date().toISOString() + "] " + msg;
  try { fs.appendFileSync(LOG, line + "\n", "utf8"); } catch (e) {}
  console.log(line);
}
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function clickBtn(page, exactText) {
  const b = page.locator("button").filter({ hasText: new RegExp("^" + exactText + "$") }).last();
  if (await b.count().catch(() => 0)) { await b.click({ timeout: 2000 }).catch(() => {}); await wait(700); return true; }
  return false;
}

function loadChapter(n) {
  const prefix = String(n).padStart(3, "0") + "-";
  const f = fs.readdirSync(CHAPTERS_DIR).find(x => x.startsWith(prefix) && x.endsWith(".txt"));
  if (!f) throw new Error("未找到章节文件: " + n);
  const raw = fs.readFileSync(path.join(CHAPTERS_DIR, f), "utf8").trim();
  const lines = raw.split(/\r?\n/);
  const firstLine = lines[0].trim();
  const body = lines.slice(1).join("\n").trim();
  const m = firstLine.match(/^第\s*\d+\s*章\s*[:：、.\-\s]*(.+)$/);
  return { title: m ? m[1].trim() : firstLine, body };
}

async function fillByKeyboard(page, locator, text) {
  await locator.click({ timeout: 3000 }).catch(() => {});
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.insertText(text);
  await wait(1000);
}

async function uploadOne(ctx, managePage, n) {
  const ch = loadChapter(n);
  log(`开始第${n}章《${ch.title}》 正文字符=${ch.body.length}`);

  // 1. 点"新建草稿"
  const newDraft = managePage.getByRole("button", { name: /新建草稿/ }).first();
  if (await newDraft.count().catch(() => 0)) { await newDraft.click({ timeout: 2500 }).catch(() => {}); }
  else { await managePage.locator("text=新建草稿").first().click({ timeout: 2500 }).catch(() => {}); }

  // 2. 等新编辑页标签（要求 URL 已生成草稿ID，否则太早填标题会丢失）
  let editorPage = null;
  for (let i = 0; i < 40; i++) {
    await wait(1000);
    for (const p of await ctx.pages()) {
      if (p.url().includes("/publish/") && /publish\/\d+/.test(p.url()) && p !== managePage && !p.isClosed()) {
        const hasEditor = await p.evaluate(() => !!document.querySelector(".ProseMirror[contenteditable='true'], input[placeholder*='标题']")).catch(() => false);
        if (hasEditor) { editorPage = p; break; }
      }
    }
    if (editorPage) break;
  }
  if (!editorPage) { log(`第${n}章 失败：未找到新编辑页`); return { ok: false, reason: "no-editor" }; }
  log(`第${n}章 编辑页: ${editorPage.url()}`);

  // 3. 处理弹窗
  await clickBtn(editorPage, "放弃");
  for (const l of ["知道了", "跳过"]) await clickBtn(editorPage, l);

  // 3.5 填章节号（必须用 fill，键盘输入对章节号框无效）
  const noSel = editorPage.locator("input.serial-input.byte-input.byte-input-size-default").first();
  if (await noSel.count().catch(() => 0)) {
    await noSel.fill(String(n), { timeout: 3000 }).catch(() => {});
    await wait(800);
    const noV = await noSel.inputValue().catch(() => "");
    if (noV !== String(n)) {
      log(`第${n}章 失败：章节号填写失败(="${noV}")`);
      await editorPage.close().catch(() => {});
      return { ok: false, reason: "no-fill" };
    }
    log(`第${n}章 章节号已填: ${n}`);
  } else {
    log(`第${n}章 失败：未找到章节号框`);
    await editorPage.close().catch(() => {});
    return { ok: false, reason: "no-no-sel" };
  }

  // 4. 填标题（键盘输入 + 校验，失败重试）
  const titleSel = editorPage.locator("input.serial-input.serial-editor-input-hint-area.byte-input.byte-input-size-default").first();
  if (await titleSel.count().catch(() => 0)) {
    let titleOk = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      await fillByKeyboard(editorPage, titleSel, ch.title);
      const v = await titleSel.inputValue().catch(() => "");
      if (v === ch.title) { titleOk = true; break; }
      log(`第${n}章 标题第${attempt + 1}次填写未生效(当前="${v}")，重试`);
      await wait(1000);
    }
    if (!titleOk) { log(`第${n}章 失败：标题填写失败`); await editorPage.close().catch(() => {}); return { ok: false, reason: "title-fill" }; }
    log(`第${n}章 标题已填: ${ch.title}`);
  } else {
    log(`第${n}章 失败：未找到标题框`); await editorPage.close().catch(() => {}); return { ok: false, reason: "no-title" };
  }

  // 5. 填正文（键盘输入）
  const editor = editorPage.locator(".ProseMirror[contenteditable='true']").first();
  if (await editor.count().catch(() => 0)) {
    await editor.click({ timeout: 3000 }).catch(() => {});
    await editorPage.keyboard.press("Control+A");
    await editorPage.keyboard.press("Backspace");
    await editorPage.keyboard.insertText(ch.body);
    await wait(1500);
  } else {
    log(`第${n}章 失败：未找到正文编辑器`); await editorPage.close().catch(() => {}); return { ok: false, reason: "no-body" };
  }

  // 6. 点存草稿
  const saved = await clickBtn(editorPage, "存草稿");
  if (!saved) { log(`第${n}章 失败：未找到存草稿按钮`); await editorPage.close().catch(() => {}); return { ok: false, reason: "no-save" }; }
  await wait(4000);

  // 7. 关闭编辑页
  await editorPage.close().catch(() => {});
  log(`第${n}章 完成（已点存草稿）`);
  return { ok: true };
}

async function main() {
  fs.writeFileSync(LOG, "");
  log(`批量上传开始：第${start}-${end}章，每章间隔${intervalSec}秒`);
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false, executablePath: EDGE, viewport: { width: 1440, height: 1000 },
  });
  const managePage = ctx.pages()[0] || await ctx.newPage();
  await managePage.goto(MANAGE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await managePage.waitForTimeout(8000);

  // 关闭旧的编辑页标签
  for (const p of await ctx.pages()) {
    if (p !== managePage && p.url().includes("/publish/")) { await p.close().catch(() => {}); }
  }

  let okCount = 0, failCount = 0;
  for (let n = start; n <= end; n++) {
    const r = await uploadOne(ctx, managePage, n);
    if (r.ok) okCount++; else failCount++;
    if (n < end) { log(`等待 ${intervalSec} 秒...`); await wait(intervalSec * 1000); }
  }
  log(`批量上传结束：成功 ${okCount} 章，失败 ${failCount} 章`);
  await ctx.close().catch(() => {});
}

main().catch(e => { log("FATAL: " + e.message); process.exit(1); });
