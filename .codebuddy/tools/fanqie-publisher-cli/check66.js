const { chromium } = require('playwright');
const USER_DATA_DIR = require('path').join(__dirname, '.fanqie-browser-profile');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BOOK_ID = '7665606959365639230';

(async () => {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, { headless: false, executablePath: EDGE, viewport: { width: 1440, height: 1000 } });
  for (const p of await ctx.pages()) await p.close().catch(() => {});
  const page = await ctx.newPage();
  const MANAGE = `https://fanqienovel.com/main/writer/chapter-manage/${BOOK_ID}&师父飞升后留下三百个差评?type=2&from=`;
  await page.goto(MANAGE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(9000);
  const text = await page.evaluate(() => document.body.innerText);
  // 找第66章相关状态
  const lines = text.split('\n').filter(l => l.includes('章') || l.includes('待发布') || l.includes('已发布') || l.includes('草稿'));
  console.log('==== 章节管理页关键行 ====');
  lines.slice(0, 60).forEach(l => console.log(l.trim()));
  // 切草稿箱
  const draftTab = page.locator("[role='tab'], [class*='tab']").filter({ hasText: /^草稿箱$/ }).first();
  if (await draftTab.count().catch(() => 0)) { await draftTab.click().catch(() => {}); }
  else { await page.locator('text=草稿箱').first().click().catch(() => {}); }
  await page.waitForTimeout(4000);
  const draftText = await page.evaluate(() => document.body.innerText);
  const draftMatch = draftText.match(/共(\d+)篇草稿/);
  console.log('==== 草稿箱 ====');
  console.log('草稿箱共:', draftMatch ? draftMatch[1] : '?', '篇');
  await ctx.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
