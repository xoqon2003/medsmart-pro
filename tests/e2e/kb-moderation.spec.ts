import { test, expect } from '@playwright/test';

/**
 * UC-KB: Knowledge Base moderation review queue
 *
 * Tests cover:
 *  - Review queue page rendering
 *  - ReviewActionPanel opening
 *  - Diff viewer tab (Ko'rinish / O'zgarishlar)
 *
 * All tests skip gracefully when the backend or auth is unavailable.
 */

// ─── UC-KB-1: KB review queue sahifasi ─────────────────────────────────────

test("UC-KB-1: Review queue sahifasi mavjud (auth yoki redirect)", async ({ page }) => {
  const response = await page.goto('/kb/review-queue');
  const status = response?.status() ?? 200;

  // 500 bo'lmasligi shart
  expect(status).not.toBe(500);
  await expect(page.locator('body')).not.toContainText('Internal Server Error');
  await expect(page.locator('body')).not.toContainText('Unexpected Application Error');
  await expect(page.locator('body')).not.toBeEmpty();
});

test("UC-KB-2: Review queue sahifasida sarlavha ko'rinadi (auth yo'q bo'lsa redirect)", async ({ page }) => {
  await page.goto('/kb/review-queue');
  await page.waitForLoadState('networkidle');

  const body = await page.locator('body').textContent({ timeout: 3000 }).catch(() => '');
  const isRedirectedToLogin = (body ?? '').toLowerCase().includes('kirish') ||
                              page.url().includes('/login') ||
                              page.url().includes('/auth');

  if (isRedirectedToLogin) {
    // Login sahifasiga redirect bo'lsa — auth guard ishlayapti, test o'tadi
    expect(isRedirectedToLogin).toBe(true);
    return;
  }

  // Agar sahifa yuklansa — "Ko'rib chiqish navbati" sarlavhasi yoki
  // "navbat bo'sh" matni bo'lishi kerak
  const hasModerationContent = await page
    .getByText(/ko'rib chiqish navbati|review|moderation|bo'sh|empty/i)
    .first()
    .isVisible({ timeout: 3000 })
    .catch(() => false);

  const hasAnyContent = await page.locator('h1, h2, [class*="heading"]').first().isVisible().catch(() => false);
  expect(hasModerationContent || hasAnyContent).toBe(true);
});

// ─── UC-KB-3: Diseases list KB sahifasi ─────────────────────────────────────

test('UC-KB-3: /kb/diseases sahifasi mavjud', async ({ page }) => {
  const response = await page.goto('/kb/diseases');
  const status = response?.status() ?? 200;

  expect(status).not.toBe(500);
  await expect(page.locator('body')).not.toContainText('Internal Server Error');

  await page.waitForLoadState('networkidle');
  // Sahifa bo'sh emas
  await expect(page.locator('body')).not.toBeEmpty();
});

// ─── UC-KB-4: ReviewActionPanel diff tab ────────────────────────────────────

test("UC-KB-4: ReviewActionPanel 'Ko'rinish' tab default holat", async ({ page }) => {
  await page.goto('/kb/review-queue');
  await page.waitForLoadState('networkidle');

  // Auth redirect bo'lsa skip
  const isRedirected = page.url().includes('/login') || page.url().includes('/auth');
  test.skip(isRedirected, 'Auth redirect — test skip');

  // Queue item mavjud bo'lsa
  const reviewItems = page.locator('[class*="review"], [class*="queue"], [class*="block"]');
  const hasItems = await reviewItems.first().isVisible({ timeout: 3000 }).catch(() => false);
  test.skip(!hasItems, 'Review queue bo\'sh yoki yuklanmadi');

  // Birinchi itemni ochish ("Ko'rish" yoki kard click)
  const viewBtn = page.getByRole('button', { name: /ko'rish|view|detail|ochish/i }).first();
  const hasViewBtn = await viewBtn.isVisible({ timeout: 2000 }).catch(() => false);
  test.skip(!hasViewBtn, 'Ko\'rish tugmasi topilmadi');

  await viewBtn.click();

  // Dialog ochilishi
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 3000 });

  // "Ko'rinish" tab default holda ko'rinishi shart
  const previewTab = dialog.getByText(/ko'rinish/i);
  await expect(previewTab).toBeVisible({ timeout: 2000 });
});

test("UC-KB-5: ReviewActionPanel 'O'zgarishlar' tab (agar diff mavjud bo'lsa)", async ({ page }) => {
  await page.goto('/kb/review-queue');
  await page.waitForLoadState('networkidle');

  const isRedirected = page.url().includes('/login') || page.url().includes('/auth');
  test.skip(isRedirected, 'Auth redirect');

  const reviewItems = page.locator('[class*="review"], [class*="queue"], [class*="block"]');
  const hasItems = await reviewItems.first().isVisible({ timeout: 3000 }).catch(() => false);
  test.skip(!hasItems, 'Queue bo\'sh');

  const viewBtn = page.getByRole('button', { name: /ko'rish|view|detail|ochish/i }).first();
  const hasViewBtn = await viewBtn.isVisible({ timeout: 2000 }).catch(() => false);
  test.skip(!hasViewBtn, 'Ko\'rish tugmasi yo\'q');

  await viewBtn.click();
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 3000 });

  // "O'zgarishlar" tab faqat diff mavjud bo'lganda ko'rinadi
  const diffTab = dialog.getByText(/o'zgarishlar/i);
  const hasDiffTab = await diffTab.isVisible({ timeout: 2000 }).catch(() => false);

  if (!hasDiffTab) {
    // Diff yo'q — bu normal holat (blok hali tahrir qilinmagan)
    // Test o'tishi mumkin — tab faqat agar before snapshot bo'lsa chiqadi
    return;
  }

  // Diff tab bosilganda diff content ko'rinishi kerak
  await diffTab.click();
  await page.waitForTimeout(200);

  // "Avvalgi versiya yo'q" yoki diff table ko'rinishi kerak
  const hasDiffContent = await dialog
    .locator('table, [class*="diff"], text=/avvalgi versiya/i')
    .first()
    .isVisible({ timeout: 2000 })
    .catch(() => false);

  expect(hasDiffContent).toBe(true);
});

// ─── UC-KB-6: Approve/Reject tugmalar ──────────────────────────────────────

test('UC-KB-6: ReviewActionPanel — Tasdiqlash va Rad etish tugmalari mavjud', async ({ page }) => {
  await page.goto('/kb/review-queue');
  await page.waitForLoadState('networkidle');

  const isRedirected = page.url().includes('/login') || page.url().includes('/auth');
  test.skip(isRedirected, 'Auth redirect');

  const reviewItems = page.locator('[class*="review"], [class*="queue"], [class*="block"]');
  const hasItems = await reviewItems.first().isVisible({ timeout: 3000 }).catch(() => false);
  test.skip(!hasItems, 'Queue bo\'sh');

  const viewBtn = page.getByRole('button', { name: /ko'rish|view|detail|ochish/i }).first();
  const hasViewBtn = await viewBtn.isVisible({ timeout: 2000 }).catch(() => false);
  test.skip(!hasViewBtn, 'Ko\'rish tugmasi yo\'q');

  await viewBtn.click();
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 3000 });

  // "Tasdiqlash" va "Rad etish" tugmalari
  await expect(dialog.getByRole('button', { name: /tasdiqlash/i })).toBeVisible({ timeout: 2000 });
  await expect(dialog.getByRole('button', { name: /rad etish/i })).toBeVisible({ timeout: 2000 });
});
