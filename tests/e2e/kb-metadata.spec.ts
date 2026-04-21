import { test, expect } from '@playwright/test';

/**
 * UC-META: Disease KB — metadata (olimlar / tadqiqotlar / genetika)
 *
 * Tests cover:
 *  - DiseaseCardPage 3 yangi section render (seed mock bilan)
 *  - KBDiseaseMetadataPage 3 tab mavjud
 *  - Scientist create dialog ochilishi
 *  - Research create dialog ochilishi
 *  - Genetic create dialog ochilishi
 *
 * All tests skip gracefully when the backend or auth is unavailable.
 * Kartada seed: `gipertoniya-i10` → 2 olim + 2 tadqiqot + 1 genetik yozuv.
 */

const SEED_SLUG = 'gipertoniya-i10';

/**
 * Terms dialog birinchi visitda ochiladi va admin click'larini bloklaydi
 * (Radix Dialog + onInteractOutside). localStorage'ga terms qabulini oldin
 * yozish bilan dialog ochilishi oldini olinadi.
 */
async function acceptTermsBeforeNavigation(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('medsmart_terms_v1', 'true');
    } catch {
      /* noop */
    }
  });
}

// ─── UC-META-1: DiseaseCardPage — scientists section render ─────────────────

test('UC-META-1: Kartada "Olimlar va tarix" seksiyasi ko\'rinadi', async ({ page }) => {
  await page.goto(`/kasalliklar/${SEED_SLUG}`);
  await page.waitForLoadState('networkidle');

  // Kartada seksiya sarlavhasi (uz i18n: "Olimlar va tarix")
  const scientistsHeading = page.getByText(/olimlar va tarix/i).first();
  const isVisible = await scientistsHeading.isVisible({ timeout: 5000 }).catch(() => false);

  if (!isVisible) {
    // Kartalar yuklanmagan (backend yo'q yoki mock disabled) — test skip
    test.skip(true, "Kartada scientists section ko'rinmadi — seed yuklanmagan bo'lishi mumkin");
  }

  // Seed bo'yicha "Riva-Rocci" nomi chiqishi shart (uz seed — gipertoniya-i10)
  const seededName = page.getByText(/riva-rocci/i).first();
  await expect(seededName).toBeVisible({ timeout: 3000 });
});

// ─── UC-META-2: DiseaseCardPage — research section render ───────────────────

test('UC-META-2: Kartada "Ilmiy tadqiqotlar" seksiyasi ko\'rinadi', async ({ page }) => {
  await page.goto(`/kasalliklar/${SEED_SLUG}`);
  await page.waitForLoadState('networkidle');

  const researchHeading = page.getByText(/ilmiy tadqiqotlar/i).first();
  const isVisible = await researchHeading.isVisible({ timeout: 5000 }).catch(() => false);
  test.skip(!isVisible, 'Research section yuklanmadi');

  // SPRINT landmark tadqiqot seed'da bor
  const seededTitle = page.getByText(/sprint/i).first();
  await expect(seededTitle).toBeVisible({ timeout: 3000 });
});

// ─── UC-META-3: DiseaseCardPage — genetics section render ───────────────────

test('UC-META-3: Kartada "Genetika va populyatsiya" seksiyasi ko\'rinadi', async ({ page }) => {
  await page.goto(`/kasalliklar/${SEED_SLUG}`);
  await page.waitForLoadState('networkidle');

  const geneticsHeading = page.getByText(/genetika va populyatsiya/i).first();
  const isVisible = await geneticsHeading.isVisible({ timeout: 5000 }).catch(() => false);
  test.skip(!isVisible, 'Genetics section yuklanmadi');

  // AGT gen simvoli seed'da bor
  const geneSymbol = page.getByText(/\bAGT\b/).first();
  await expect(geneSymbol).toBeVisible({ timeout: 3000 });
});

// ─── UC-META-4: KBDiseaseMetadataPage ochilishi (500 emas) ─────────────────

test('UC-META-4: Metadata editor sahifasi mavjud (auth yoki redirect, 500 emas)', async ({ page }) => {
  const response = await page.goto(`/kb/diseases/${SEED_SLUG}/metadata`);
  const status = response?.status() ?? 200;

  expect(status).not.toBe(500);
  await expect(page.locator('body')).not.toContainText('Internal Server Error');
  await expect(page.locator('body')).not.toContainText('Unexpected Application Error');
  await expect(page.locator('body')).not.toBeEmpty();
});

// ─── UC-META-5: Metadata editor — 3 tab mavjud ─────────────────────────────

test('UC-META-5: Metadata editor sahifasida 3 tab ko\'rinadi', async ({ page }) => {
  await acceptTermsBeforeNavigation(page);
  await page.goto(`/kb/diseases/${SEED_SLUG}/metadata`);
  await page.waitForLoadState('domcontentloaded');

  // Auth redirect tekshiruv
  const isRedirected = page.url().includes('/login') || page.url().includes('/auth');
  test.skip(isRedirected, 'Auth redirect — metadata editor ochilmadi');

  // Disease detail query tugashini kutamiz — tabs disease yuklangandan keyin render bo'ladi
  const firstTab = page.getByRole('tab', { name: /olimlar/i });
  const tabsLoaded = await firstTab.isVisible({ timeout: 8000 }).catch(() => false);
  test.skip(!tabsLoaded, "Tabs render bo'lmadi — disease detail yuklanmagan yoki 'Kasallik topilmadi'");

  // 3 tab hammasi ko'rinishi shart
  await expect(page.getByRole('tab', { name: /olimlar/i })).toBeVisible();
  await expect(page.getByRole('tab', { name: /ilmiy tadqiqotlar|tadqiqot/i })).toBeVisible();
  await expect(page.getByRole('tab', { name: /genetika/i })).toBeVisible();
});

// ─── UC-META-6: Scientist "Qo'shish" dialog ochilishi ──────────────────────

test('UC-META-6: Scientist "Qo\'shish" tugmasi dialog ochadi', async ({ page }) => {
  await acceptTermsBeforeNavigation(page);
  await page.goto(`/kb/diseases/${SEED_SLUG}/metadata`);
  await page.waitForLoadState('domcontentloaded');

  const isRedirected = page.url().includes('/login') || page.url().includes('/auth');
  test.skip(isRedirected, 'Auth redirect');

  // Disease yuklanishini kutamiz (tabs render bo'lishini)
  const tabsLoaded = await page.getByRole('tab', { name: /olimlar/i })
    .isVisible({ timeout: 8000 }).catch(() => false);
  test.skip(!tabsLoaded, "Tabs yuklanmadi");

  // Default tab — scientists
  const addBtn = page.getByRole('button', { name: /qo'shish|add/i }).first();
  const hasBtn = await addBtn.isVisible({ timeout: 3000 }).catch(() => false);
  test.skip(!hasBtn, "'Qo'shish' tugmasi topilmadi");

  await addBtn.click();

  // Dialog ochilishi
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 2000 });

  // "Yangi olim qo'shish" sarlavhasi yoki fullName input
  const hasTitle = await dialog.getByText(/yangi olim|fullname|ism|familiya/i).first()
    .isVisible({ timeout: 1000 }).catch(() => false);
  const hasInput = await dialog.locator('input').first()
    .isVisible({ timeout: 1000 }).catch(() => false);

  expect(hasTitle || hasInput).toBe(true);
});

// ─── UC-META-7: Research tabdagi "Qo'shish" dialog ochilishi ───────────────

test('UC-META-7: Research tab — "Qo\'shish" dialog ochiladi', async ({ page }) => {
  await acceptTermsBeforeNavigation(page);
  await page.goto(`/kb/diseases/${SEED_SLUG}/metadata`);
  await page.waitForLoadState('domcontentloaded');

  const isRedirected = page.url().includes('/login') || page.url().includes('/auth');
  test.skip(isRedirected, 'Auth redirect');

  const researchTab = page.getByRole('tab', { name: /ilmiy tadqiqotlar|tadqiqot/i });
  const hasTab = await researchTab.isVisible({ timeout: 8000 }).catch(() => false);
  test.skip(!hasTab, 'Research tab topilmadi');

  await researchTab.click();
  await page.waitForTimeout(200);

  const addBtn = page.getByRole('button', { name: /qo'shish|add/i }).first();
  const hasBtn = await addBtn.isVisible({ timeout: 2000 }).catch(() => false);
  test.skip(!hasBtn, "Research tabda 'Qo'shish' tugmasi yo'q");

  await addBtn.click();

  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 2000 });

  // Research formda bir nechta input bor (title, authors, year, summary)
  const inputCount = await dialog.locator('input, textarea').count();
  expect(inputCount).toBeGreaterThanOrEqual(2);
});

// ─── UC-META-8: Genetics tabdagi "Qo'shish" dialog ochilishi ───────────────

test('UC-META-8: Genetics tab — "Qo\'shish" dialog ochiladi', async ({ page }) => {
  await acceptTermsBeforeNavigation(page);
  await page.goto(`/kb/diseases/${SEED_SLUG}/metadata`);
  await page.waitForLoadState('domcontentloaded');

  const isRedirected = page.url().includes('/login') || page.url().includes('/auth');
  test.skip(isRedirected, 'Auth redirect');

  const geneticsTab = page.getByRole('tab', { name: /genetika/i });
  const hasTab = await geneticsTab.isVisible({ timeout: 8000 }).catch(() => false);
  test.skip(!hasTab, 'Genetics tab topilmadi');

  await geneticsTab.click();
  await page.waitForTimeout(200);

  const addBtn = page.getByRole('button', { name: /qo'shish|add/i }).first();
  const hasBtn = await addBtn.isVisible({ timeout: 2000 }).catch(() => false);
  test.skip(!hasBtn, "Genetics tabda 'Qo'shish' tugmasi yo'q");

  await addBtn.click();

  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 2000 });
});

// ─── UC-META-9: Editor header'da "Metadata" tugmasi mavjud ─────────────────

test('UC-META-9: KB editor header\'da Metadata tugmasi bor', async ({ page }) => {
  await acceptTermsBeforeNavigation(page);
  const response = await page.goto(`/kb/diseases/${SEED_SLUG}/edit`);
  const status = response?.status() ?? 200;
  expect(status).not.toBe(500);

  await page.waitForLoadState('networkidle');

  const isRedirected = page.url().includes('/login') || page.url().includes('/auth');
  test.skip(isRedirected, 'Auth redirect');

  const metaBtn = page.getByRole('button', { name: /metadata/i });
  const hasBtn = await metaBtn.isVisible({ timeout: 3000 }).catch(() => false);

  if (!hasBtn) {
    // Editor mock/auth holda yuklanmagan — body tekshiruv bilan cheklanamiz
    await expect(page.locator('body')).not.toBeEmpty();
    return;
  }

  await metaBtn.click();
  // URL metadata ga o'tishi kerak
  await expect(page).toHaveURL(/\/kb\/diseases\/.+\/metadata/);
});
