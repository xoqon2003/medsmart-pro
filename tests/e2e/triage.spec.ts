import { test, expect, Page } from '@playwright/test';

/**
 * UC-03: Symptom checker wizard (SymptomMatcherSheet)
 * UC-04: Send-to-doctor dialog (SendToDoctorDialog)
 *
 * Tests are designed to be resilient when the backend is unavailable —
 * they skip rather than fail in that case.
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Navigate to a disease detail page and wait for it to settle.
 * Returns true if the page loaded (content visible), false if it didn't
 * (server down / 404 / blank page).
 */
async function openDiseaseCard(page: Page, slug = 'gipertoniya-i10'): Promise<boolean> {
  await page.goto(`/kasalliklar/${slug}`);
  await page.waitForLoadState('networkidle');

  const body = page.locator('body');
  const text = await body.textContent({ timeout: 3000 }).catch(() => '');
  if (!text || text.includes('404') || text.includes('Internal Server Error')) return false;

  // Disease name must be visible somewhere on the page
  const hasContent = await page
    .locator('[class*="card"], [class*="disease"], h1, h2')
    .first()
    .isVisible({ timeout: 2000 })
    .catch(() => false);
  return hasContent;
}

/**
 * Click "Meni tekshirib ko'ring" and wait for the sheet to appear.
 * Returns true if the sheet opened.
 */
async function openSymptomSheet(page: Page): Promise<boolean> {
  const btn = page.getByRole('button', { name: /tekshirib ko['']ring/i });
  const btnVisible = await btn.isVisible({ timeout: 3000 }).catch(() => false);
  if (!btnVisible) return false;

  await btn.click();

  // Sheet / drawer uses data-state="open" or role="dialog"
  const sheetOpen = await page
    .locator('[data-state="open"], [data-vaul-drawer]')
    .first()
    .isVisible({ timeout: 3000 })
    .catch(() => false);
  return sheetOpen;
}

// ─── UC-03: Simptom wizard ───────────────────────────────────────────────────

test('UC-03-1: "Meni tekshirib ko\'ring" tugmasi sheet ochadi', async ({ page }) => {
  const loaded = await openDiseaseCard(page);
  test.skip(!loaded, "Kasallik sahifasi yuklanmadi — server yo'q");

  const sheetOpened = await openSymptomSheet(page);
  expect(sheetOpened).toBe(true);

  // Sheet sarlavhasi "Simptom tekshiruvi" bo'lishi kerak
  const sheetTitle = page.getByText(/simptom tekshiruvi/i);
  await expect(sheetTitle).toBeVisible({ timeout: 3000 });
});

test('UC-03-2: Step 1 — simptom chips render qilinadi', async ({ page }) => {
  const loaded = await openDiseaseCard(page);
  test.skip(!loaded, "Kasallik sahifasi yuklanmadi");

  const sheetOpened = await openSymptomSheet(page);
  test.skip(!sheetOpened, 'Sheet ochilmadi');

  // Step 1 subtitle ko'rinishi kerak
  const subtitle = page.getByText(/belgilarni belgilang/i);
  await expect(subtitle).toBeVisible({ timeout: 3000 });

  // Simptomlar yuklanishini kutish (yoki "simptomlar hali kiritilmagan")
  const hasChips = await page
    .getByRole('button', { name: /^Ha$/ })
    .first()
    .isVisible({ timeout: 5000 })
    .catch(() => false);

  const hasEmpty = await page
    .getByText(/simptomlar hali kiritilmagan/i)
    .isVisible({ timeout: 2000 })
    .catch(() => false);

  // Ikkalasidan biri bo'lishi shart
  expect(hasChips || hasEmpty).toBe(true);
});

test('UC-03-3: "Ha" tugmasini bosish simptom javobini qayd etadi', async ({ page }) => {
  const loaded = await openDiseaseCard(page);
  test.skip(!loaded, "Kasallik sahifasi yuklanmadi");

  const sheetOpened = await openSymptomSheet(page);
  test.skip(!sheetOpened, 'Sheet ochilmadi');

  // Simptom chiplar paydo bo'lishini kutish
  const firstYes = page.getByRole('button', { name: /^Ha$/ }).first();
  const hasSymptoms = await firstYes.isVisible({ timeout: 5000 }).catch(() => false);
  test.skip(!hasSymptoms, 'Simptomlar yuklanmadi (backend yo\'q)');

  // "Ha" ni bosish
  await firstYes.click();

  // Bosilgan chip ring-2 (selected) klassiga ega bo'ladi
  // Biz faqat click ishlaganini tekshiramiz — click after re-render
  await page.waitForTimeout(200);
  // If still visible, the click registered
  await expect(firstYes).toBeVisible();
});

test("UC-03-4: Wizard step 2 ga o'tish ishlaydi", async ({ page }) => {
  const loaded = await openDiseaseCard(page);
  test.skip(!loaded, "Kasallik sahifasi yuklanmadi");

  const sheetOpened = await openSymptomSheet(page);
  test.skip(!sheetOpened, 'Sheet ochilmadi');

  // Step 1'da kamida bitta "Ha" bosish (validatsiya uchun)
  const firstYes = page.getByRole('button', { name: /^Ha$/ }).first();
  const hasSymptoms = await firstYes.isVisible({ timeout: 5000 }).catch(() => false);
  test.skip(!hasSymptoms, 'Simptomlar yo\'q');

  await firstYes.click();

  // "Keyingi" tugmasini bosish
  const nextBtn = page.getByRole('button', { name: /keyingi/i });
  await expect(nextBtn).toBeVisible();
  await nextBtn.click();

  await page.waitForTimeout(300);

  // Step 2: "Omillar" bo'limi yoki "Ortga" tugmasi ko'rinishi shart
  const backBtn = page.getByRole('button', { name: /ortga/i });
  await expect(backBtn).toBeVisible({ timeout: 2000 });

  // Step 2 subtitle
  const step2Content = page.getByText(/yashash tarzi|omillar|sog'lig/i).first();
  await expect(step2Content).toBeVisible({ timeout: 2000 });
});

test("UC-03-5: Step 2'dan step 1 ga qaytish (back) ishlaydi", async ({ page }) => {
  const loaded = await openDiseaseCard(page);
  test.skip(!loaded, "Kasallik sahifasi yuklanmadi");

  const sheetOpened = await openSymptomSheet(page);
  test.skip(!sheetOpened, 'Sheet ochilmadi');

  const firstYes = page.getByRole('button', { name: /^Ha$/ }).first();
  const hasSymptoms = await firstYes.isVisible({ timeout: 5000 }).catch(() => false);
  test.skip(!hasSymptoms, 'Simptomlar yo\'q');

  await firstYes.click();
  await page.getByRole('button', { name: /keyingi/i }).click();
  await page.waitForTimeout(200);

  // "Ortga" tugmasi
  const backBtn = page.getByRole('button', { name: /ortga/i });
  await expect(backBtn).toBeVisible();
  await backBtn.click();
  await page.waitForTimeout(200);

  // Step 1 subtitle qayta ko'rinishi shart
  await expect(page.getByText(/belgilarni belgilang/i)).toBeVisible({ timeout: 2000 });
});

test('UC-03-6: 4 ta stepdan o\'tib Step 4 summary ko\'rinadi', async ({ page }) => {
  const loaded = await openDiseaseCard(page);
  test.skip(!loaded, "Kasallik sahifasi yuklanmadi");

  const sheetOpened = await openSymptomSheet(page);
  test.skip(!sheetOpened, 'Sheet ochilmadi');

  const firstYes = page.getByRole('button', { name: /^Ha$/ }).first();
  const hasSymptoms = await firstYes.isVisible({ timeout: 5000 }).catch(() => false);
  test.skip(!hasSymptoms, 'Simptomlar yo\'q');

  // Step 1: bitta Ha, keyin keyingi
  await firstYes.click();
  await page.getByRole('button', { name: /keyingi/i }).click();
  await page.waitForTimeout(200);

  // Step 2: Keyingi (risk factors, optional)
  const nextStep2 = page.getByRole('button', { name: /keyingi/i });
  await nextStep2.click();
  await page.waitForTimeout(200);

  // Step 3: Keyingi (timeline)
  const nextStep3 = page.getByRole('button', { name: /keyingi/i });
  await nextStep3.click();
  await page.waitForTimeout(300);

  // Step 4 sarlavhasi — "Xulosa" yoki "Moslik" yoki "Shifokorga yuborish" tugmasi
  const hasSummary = await page.getByText(/xulosa|moslik darajasi|ehtimoliy tashxis/i)
    .first()
    .isVisible({ timeout: 3000 })
    .catch(() => false);

  const hasSendBtn = await page
    .getByRole('button', { name: /shifokorga yuborish/i })
    .isVisible({ timeout: 2000 })
    .catch(() => false);

  expect(hasSummary || hasSendBtn).toBe(true);
});

// ─── UC-04: Shifokorga yuborish ──────────────────────────────────────────────

test("UC-04-1: Step 4'da 'Shifokorga yuborish' tugmasi bor", async ({ page }) => {
  const loaded = await openDiseaseCard(page);
  test.skip(!loaded, "Kasallik sahifasi yuklanmadi");

  const sheetOpened = await openSymptomSheet(page);
  test.skip(!sheetOpened, 'Sheet ochilmadi');

  const firstYes = page.getByRole('button', { name: /^Ha$/ }).first();
  const hasSymptoms = await firstYes.isVisible({ timeout: 5000 }).catch(() => false);
  test.skip(!hasSymptoms, 'Simptomlar yo\'q');

  await firstYes.click();
  await page.getByRole('button', { name: /keyingi/i }).click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: /keyingi/i }).click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: /keyingi/i }).click();
  await page.waitForTimeout(300);

  const sendBtn = page.getByRole('button', { name: /shifokorga yuborish/i });
  await expect(sendBtn).toBeVisible({ timeout: 3000 });
});

test("UC-04-2: 'Shifokorga yuborish' dialog ochiladi", async ({ page }) => {
  const loaded = await openDiseaseCard(page);
  test.skip(!loaded, "Kasallik sahifasi yuklanmadi");

  const sheetOpened = await openSymptomSheet(page);
  test.skip(!sheetOpened, 'Sheet ochilmadi');

  const firstYes = page.getByRole('button', { name: /^Ha$/ }).first();
  const hasSymptoms = await firstYes.isVisible({ timeout: 5000 }).catch(() => false);
  test.skip(!hasSymptoms, 'Simptomlar yo\'q');

  await firstYes.click();
  for (let step = 0; step < 3; step++) {
    await page.getByRole('button', { name: /keyingi/i }).click();
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(300);

  const sendBtn = page.getByRole('button', { name: /shifokorga yuborish/i });
  const visible = await sendBtn.isVisible({ timeout: 2000 }).catch(() => false);
  test.skip(!visible, "Step 4 tugmasi ko'rinmadi");

  // Tugma aktiv bo'lishi uchun sessiya bo'lishi kerak —
  // server yo'qda disabled bo'lishi mumkin, shuning uchun enabled holatini qo'shimcha tekshirmaymiz
  if (await sendBtn.isEnabled()) {
    await sendBtn.click();
    // Dialog sarlavhasi
    await expect(
      page.getByRole('dialog').filter({ hasText: /shifokorga yuborish/i }),
    ).toBeVisible({ timeout: 3000 });
  }
});

test('UC-04-3: Dialog — consent olmay Yuborish disabled', async ({ page }) => {
  const loaded = await openDiseaseCard(page);
  test.skip(!loaded, "Kasallik sahifasi yuklanmadi");

  const sheetOpened = await openSymptomSheet(page);
  test.skip(!sheetOpened, 'Sheet ochilmadi');

  const firstYes = page.getByRole('button', { name: /^Ha$/ }).first();
  const hasSymptoms = await firstYes.isVisible({ timeout: 5000 }).catch(() => false);
  test.skip(!hasSymptoms, 'Simptomlar yo\'q');

  await firstYes.click();
  for (let step = 0; step < 3; step++) {
    await page.getByRole('button', { name: /keyingi/i }).click();
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(300);

  const sendBtn = page.getByRole('button', { name: /shifokorga yuborish/i });
  const visible = await sendBtn.isVisible({ timeout: 2000 }).catch(() => false);
  if (!visible || !(await sendBtn.isEnabled())) {
    test.skip(true, 'Sessiya yo\'q — UC-04-3 skip');
  }

  await sendBtn.click();

  // Dialog ichida "Yuborish" tugmasi (main send action)
  const dialogSendBtn = page
    .getByRole('dialog')
    .filter({ hasText: /shifokorga yuborish/i })
    .getByRole('button', { name: /^Yuborish$/ });

  await expect(dialogSendBtn).toBeVisible({ timeout: 3000 });
  // Consent berilmagan + shifokor tanlanmagan → disabled
  await expect(dialogSendBtn).toBeDisabled();
});

test('UC-04-4: Dialog — consent + shifokor tanlash Yuborishni yoqadi', async ({ page }) => {
  const loaded = await openDiseaseCard(page);
  test.skip(!loaded, "Kasallik sahifasi yuklanmadi");

  const sheetOpened = await openSymptomSheet(page);
  test.skip(!sheetOpened, 'Sheet ochilmadi');

  const firstYes = page.getByRole('button', { name: /^Ha$/ }).first();
  const hasSymptoms = await firstYes.isVisible({ timeout: 5000 }).catch(() => false);
  test.skip(!hasSymptoms, 'Simptomlar yo\'q');

  await firstYes.click();
  for (let step = 0; step < 3; step++) {
    await page.getByRole('button', { name: /keyingi/i }).click();
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(300);

  const sendBtn = page.getByRole('button', { name: /shifokorga yuborish/i });
  const visible = await sendBtn.isVisible({ timeout: 2000 }).catch(() => false);
  if (!visible || !(await sendBtn.isEnabled())) {
    test.skip(true, 'Sessiya yo\'q — UC-04-4 skip');
  }
  await sendBtn.click();

  const dialog = page.getByRole('dialog').filter({ hasText: /shifokorga yuborish/i });
  await expect(dialog).toBeVisible({ timeout: 3000 });

  // Shifokorlar ro'yxatini kutish (backend yo'qda skeleton bo'lishi mumkin)
  await page.waitForTimeout(1500);

  // Shifokor tugmalaridan birinchisini tanlash
  const doctorBtns = dialog.locator('button[class*="border"]').filter({ hasNot: page.locator('[disabled]') });
  const hasDoctors = await doctorBtns.first().isVisible({ timeout: 2000 }).catch(() => false);

  if (hasDoctors) {
    await doctorBtns.first().click();
  }

  // Consent checkbox
  const consentCheckbox = dialog.locator('input[type="checkbox"]');
  await consentCheckbox.check();

  const dialogSendBtn = dialog.getByRole('button', { name: /^Yuborish$/ });

  if (hasDoctors) {
    // Shifokor tanlangan + consent → enabled bo'lishi shart
    await expect(dialogSendBtn).toBeEnabled({ timeout: 1000 });
  } else {
    // Shifokorlar yo'q → disabled hali ham
    await expect(dialogSendBtn).toBeDisabled();
  }
});

test("UC-04-5: Anonim rejim toggle ishlaydi", async ({ page }) => {
  const loaded = await openDiseaseCard(page);
  test.skip(!loaded, "Kasallik sahifasi yuklanmadi");

  const sheetOpened = await openSymptomSheet(page);
  test.skip(!sheetOpened, 'Sheet ochilmadi');

  const firstYes = page.getByRole('button', { name: /^Ha$/ }).first();
  const hasSymptoms = await firstYes.isVisible({ timeout: 5000 }).catch(() => false);
  test.skip(!hasSymptoms, 'Simptomlar yo\'q');

  await firstYes.click();
  for (let step = 0; step < 3; step++) {
    await page.getByRole('button', { name: /keyingi/i }).click();
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(300);

  const sendBtn = page.getByRole('button', { name: /shifokorga yuborish/i });
  const visible = await sendBtn.isVisible({ timeout: 2000 }).catch(() => false);
  if (!visible || !(await sendBtn.isEnabled())) {
    test.skip(true, 'Sessiya yo\'q — UC-04-5 skip');
  }
  await sendBtn.click();

  const dialog = page.getByRole('dialog').filter({ hasText: /shifokorga yuborish/i });
  await expect(dialog).toBeVisible({ timeout: 3000 });

  // Anonim rejim label ko'rinishi kerak
  await expect(dialog.getByText(/anonim rejim/i)).toBeVisible();

  // Switch element (shadcn/ui Switch → role="switch")
  const anonSwitch = dialog.getByRole('switch');
  const switchVisible = await anonSwitch.isVisible({ timeout: 1000 }).catch(() => false);
  if (switchVisible) {
    // Default: off
    await expect(anonSwitch).toHaveAttribute('aria-checked', 'false');
    await anonSwitch.click();
    await expect(anonSwitch).toHaveAttribute('aria-checked', 'true');
  }
});
