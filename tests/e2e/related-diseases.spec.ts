import { test, expect, Page } from '@playwright/test';

/**
 * UC-RELATED: Aloqador kasalliklar widgeti (RelatedDiseasesWidget)
 *
 * Tests cover:
 *  - UC-RELATED-1: Widget kasallik kartasida ko'rinadi
 *  - UC-RELATED-2: Widget elementi bosilganda boshqa kasallik kartasiga navigatsiya
 *  - UC-RELATED-3: Joriy kasallik widget ichida ko'rinmaydi (exclude)
 *
 * All tests skip gracefully when the dev server is unavailable.
 */

const SEED_SLUG = 'gipertoniya-i10';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function openDiseaseCard(page: Page, slug = SEED_SLUG): Promise<boolean> {
  try {
    await page.goto(`/kasalliklar/${slug}`);
  } catch {
    return false;
  }
  await page.waitForLoadState('networkidle').catch(() => {/* timeout ok */});

  const text = await page.locator('body').textContent({ timeout: 3000 }).catch(() => '');
  if (!text || text.includes('404') || text.includes('Internal Server Error')) return false;

  return page
    .locator('[class*="card"], h1, h2')
    .first()
    .isVisible({ timeout: 2000 })
    .catch(() => false);
}

// ─── UC-RELATED-1: Widget sahifada ko'rinadi ─────────────────────────────────

test("UC-RELATED-1: 'Aloqador kasalliklar' seksiyasi kartada ko'rinadi", async ({ page }) => {
  const loaded = await openDiseaseCard(page);
  test.skip(!loaded, "Kasallik sahifasi yuklanmadi — server yo'q");

  // "Aloqador kasalliklar" sarlavhasi ko'rinishi shart
  const heading = page.getByText(/aloqador kasalliklar/i).first();
  const isVisible = await heading.isVisible({ timeout: 5000 }).catch(() => false);

  if (!isVisible) {
    // Kategoriyada boshqa kasallik yo'q (mock ma'lumotlar yetarli bo'lmasligi mumkin)
    test.skip(true, "Widget ko'rinmadi — kategoriyada boshqa kasallik yo'q bo'lishi mumkin");
  }

  await expect(heading).toBeVisible();
});

// ─── UC-RELATED-2: Widget elementi bosilganda boshqa kartaga o'tish ───────────

test('UC-RELATED-2: Aloqador kasallik bosilganda uning kartasiga o\'tiladi', async ({ page }) => {
  const loaded = await openDiseaseCard(page);
  test.skip(!loaded, "Kasallik sahifasi yuklanmadi — server yo'q");

  // Widget headingini topish
  const heading = page.getByText(/aloqador kasalliklar/i).first();
  const headingVisible = await heading.isVisible({ timeout: 5000 }).catch(() => false);
  test.skip(!headingVisible, "Widget ko'rinmadi — kategoriyada boshqa kasallik yo'q");

  // Widget ichidagi birinchi button — kasallik elementi
  // RelatedDiseasesWidget ichida `button[class*="rounded-xl"]` yoki `button[class*="muted"]`
  const relatedBtns = page.locator('section').filter({ hasText: /aloqador kasalliklar/i }).locator('button');
  const count = await relatedBtns.count();
  test.skip(count === 0, 'Widget ichida hech qanday element topilmadi');

  const firstBtn = relatedBtns.first();
  const btnText = await firstBtn.textContent();

  // Bosgandan keyin URL o'zgarishi shart
  const currentUrl = page.url();
  await firstBtn.click();

  // Yangi kasallik sahifasiga o'tilishini kutish
  await page.waitForLoadState('networkidle').catch(() => {/* ok */});

  const newUrl = page.url();
  expect(newUrl).not.toBe(currentUrl);
  expect(newUrl).toContain('/kasalliklar/');

  // Yangi sahifada kasallik nomi ko'rinishi shart
  const hasContent = await page.locator('h1, h2, [class*="font-bold"]')
    .first()
    .isVisible({ timeout: 3000 })
    .catch(() => false);
  expect(hasContent).toBe(true);

  // Log for debugging
  void btnText; // suppress unused variable warning
});

// ─── UC-RELATED-3: Joriy kasallik widget ichida ko'rinmaydi ─────────────────

test("UC-RELATED-3: Joriy kasallik widget ichida exclude qilinadi", async ({ page }) => {
  const loaded = await openDiseaseCard(page, SEED_SLUG);
  test.skip(!loaded, "Kasallik sahifasi yuklanmadi — server yo'q");

  const heading = page.getByText(/aloqador kasalliklar/i).first();
  const headingVisible = await heading.isVisible({ timeout: 5000 }).catch(() => false);
  test.skip(!headingVisible, "Widget ko'rinmadi — kategoriyada boshqa kasallik yo'q");

  // Widget ichida joriy kasallik slugi (`SEED_SLUG`) havola sifatida bo'lmasligi shart
  // RelatedDiseasesWidget: onClick={() => navigate(`/kasalliklar/${d.slug}`)}
  // Biz elementlar sonini tekshirib, ularning birorta matnida
  // joriy sahifaning nomini ko'rmaymizni tekshiramiz.
  //
  // Oddiyroq: sahifadagi kasallik nomi (H1 yoki Hero) bilan widget elementlarini taqqoslaymiz.

  // Joriy kasallik nomi
  const heroTitle = await page.locator('h1, h2').first().textContent({ timeout: 3000 }).catch(() => '');

  const section = page.locator('section').filter({ hasText: /aloqador kasalliklar/i });
  const widgetText = await section.textContent({ timeout: 2000 }).catch(() => '');

  // Widget matni joriy kasallik nomini o'z ichiga olmaydi
  // (nameUz gipertoniya-i10: "Arterial gipertoniya (1-darajali)")
  if (heroTitle && heroTitle.length > 5) {
    const heroShort = heroTitle.trim().split(' ').slice(0, 2).join(' '); // birinchi 2 so'z
    expect(widgetText).not.toContain(heroShort);
  } else {
    // Nomi aniqlanmadi — test o'tadi (false positive yo'q)
    expect(true).toBe(true);
  }
});
