const { chromium } = require('playwright');

const USER_DATA_DIR = require('path').join(__dirname, '.fanqie-browser-profile');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BOOK_ID = '7665606959365639230';

(async () => {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, { headless: false, executablePath: EDGE, viewport: { width: 1440, height: 1000 } });
  for (const p of await ctx.pages()) await p.close().catch(() => {});
  const page = await ctx.newPage();

  // 章节管理页（含已发布/待发布/草稿状态）
  const MANAGE = `https://fanqienovel.com/main/writer/chapter-manage/${BOOK_ID}&师父飞升后留下三百个差评?type=2&from=`;
  await page.goto(MANAGE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(9000);

  // dump 所有 tab 标签
  const tabs = await page.locator("[role='tab'], [class*='tab']").allInnerTexts().catch(() => []);
  console.log('TABS:', JSON.stringify(tabs));

  // 章节管理 tab 内容
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('===== 章节管理页正文(前3000字) =====');
  console.log(bodyText.slice(0, 3000));

  // 切草稿箱 tab
  const draftTab = page.locator("[role='tab'], [class*='tab']").filter({ hasText: /^草稿箱$/ }).first();
  if (await draftTab.count().catch(() => 0)) { await draftTab.click().catch(() => {}); }
  else { await page.locator('text=草稿箱').first().click().catch(() => {}); }
  await page.waitForTimeout(4000);

  const draftText = await page.evaluate(() => document.body.innerText);
  console.log('===== 草稿箱页正文(前3000字) =====');
  console.log(draftText.slice(0, 3000));

  await ctx.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
