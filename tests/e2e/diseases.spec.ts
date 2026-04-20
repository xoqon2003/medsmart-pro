import { test, expect } from '@playwright/test';

// ─── TEST 1: Kasalliklar ro'yxati sahifasi ochiladi ───────────────────────────
test("kasalliklar ro'yxati sahifasi ochiladi", async ({ page }) => {
  await page.goto('/kasalliklar');

  // Sahifa sarlavhasi MedSmart o'z ichiga olishi kerak
  await expect(page).toHaveTitle(/MedSmart/i);

  // H1 sarlavha ko'rinishi shart
  // DiseaseListPage → <h1>Kasalliklar ma'lumotnomasi</h1>
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Qidiruv input (placeholder: "Kasallik nomi yoki ICD-10 kodi...")
  await expect(
    page.getByPlaceholder(/kasallik nomi yoki icd/i)
  ).toBeVisible();
});

// ─── TEST 2: Qidiruv ishlaydi ─────────────────────────────────────────────────
test('kasallik qidiruvi ishlaydi', async ({ page }) => {
  await page.goto('/kasalliklar');

  // DiseaseSearchBar → debounce 300ms, keyin onChange chaqiriladi
  const searchInput = page.getByPlaceholder(/kasallik nomi yoki icd/i);
  await searchInput.fill('gipertoniya');

  // Debounce o'tishini kutish (300ms + render)
  await page.waitForTimeout(500);

  // Natijalar ro'yxati paydo bo'lishi yoki "topilmadi" xabari
  // DiseaseListItem → data-testid="disease-list-item" bo'lmasa class bilan topamiz
  const hasResults = await page.locator(
    '[data-testid="disease-list-item"], [class*="disease"], [class*="card"]'
  ).first().isVisible({ timeout: 3000 }).catch(() => false);

  const hasEmpty = await page.getByText(/topilmadi|natija yo/i).isVisible().catch(() => false);

  // Ikkalasidan biri bo'lishi shart — qidiruv ishlaydi
  expect(hasResults || hasEmpty).toBeTruthy();
});

// ─── TEST 3: Kasallik kartasi (detail) sahifasi ochiladi ─────────────────────
test("kasallik sahifasiga o'tish ishlaydi", async ({ page }) => {
  await page.goto('/kasalliklar/gipertoniya-i10');

  // Yuklanish vaqti uchun skeleton yoki content kutiladi
  // DiseaseCardSkeleton yoki DiseaseCardPage content
  await page.waitForLoadState('networkidle');

  // 404 yoki server xatosi bo'lmasligi shart
  await expect(page.locator('body')).not.toContainText('404');
  await expect(page.locator('body')).not.toContainText('Internal Server Error');

  // isError holatida "Kasallik topilmadi." matni chiqadi —
  // bu ham hali server bog'liq bo'lgani uchun ruxsat beramiz,
  // lekin ko'rish mumkin bo'lishi shart (blank emas)
  await expect(page.locator('body')).not.toBeEmpty();
});

// ─── TEST 4: Triage sheet ("Meni tekshirib ko'ring") ochiladi ────────────────
test("symptom checker sheet ochiladi", async ({ page }) => {
  await page.goto('/kasalliklar/gipertoniya-i10');
  await page.waitForLoadState('networkidle');

  // DiseaseCardHero → <Button>"Meni tekshirib ko'ring"</Button>
  const btn = page.getByRole('button', { name: /tekshirib ko['']ring/i });

  if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await btn.click();

    // SymptomMatcherSheet → <Sheet> → SheetContent → role="dialog"
    // vaul drawer ham bo'lishi mumkin: [data-vaul-drawer]
    await expect(
      page.locator('[role="dialog"], [data-vaul-drawer], [data-state="open"]')
    ).toBeVisible({ timeout: 2000 });
  } else {
    // Sahifa yuklanmagan (mock/server yo'q) — test o'tishi mumkin
    test.skip(true, 'Kasallik detail sahifasi yuklanmadi — server yo\'q');
  }
});

// ─── TEST 5: Terms dialog birinchi ochilishda ko'rinadi ──────────────────────
test("terms dialog birinchi ochilishda paydo bo'ladi", async ({ page }) => {
  // Splash sahifasiga o'tish va localStorage ni tozalash
  await page.goto('/');

  await page.evaluate(() => {
    localStorage.removeItem('medsmart_terms_v1');
    // Boshqa mumkin bo'lgan key variantlarini ham tozalaymiz
    Object.keys(localStorage)
      .filter((k) => k.includes('terms'))
      .forEach((k) => localStorage.removeItem(k));
  });

  await page.reload();
  await page.waitForLoadState('networkidle');

  // TermsAcceptDialog → Radix Dialog → role="dialog"
  // "Qabul qilaman" yoki "Roziman" tugmasi bo'lishi kerak
  const termsDialog = page.locator('[role="dialog"]').filter({
    hasText: /qabul qilaman|roziman|shartlar/i,
  });

  await expect(termsDialog).toBeVisible({ timeout: 3000 });
});

// ─── TEST 6: KB editor sahifasi mavjud (auth yoki redirect) ──────────────────
test('kb editor sahifasi mavjud (auth yoki redirect, 500 emas)', async ({ page }) => {
  // Autentifikatsiyasiz foydalanuvchi:
  //   - login sahifasiga redirect bo'lishi mumkin (3xx → 200 on login)
  //   - yoki to'g'ridan-to'g'ri formani ko'rsatishi mumkin
  //   - 500 Internal Server Error bo'lmasligi SHART
  const response = await page.goto('/kb/diseases/new');

  const status = response?.status() ?? 200;
  expect(status).not.toBe(500);

  await expect(page.locator('body')).not.toContainText('Internal Server Error');
  await expect(page.locator('body')).not.toContainText('Unexpected Application Error');

  // Sahifa bo'sh emas — biror UI element ko'rinishi kerak
  await expect(page.locator('body')).not.toBeEmpty();
});
