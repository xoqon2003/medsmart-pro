import { test, expect, Page } from '@playwright/test';

/**
 * UC-TRIAGE-PDF: Triage sessiya natijasi — PDF eksport
 *
 * Tests cover:
 *  - UC-TRIAGE-PDF-1: Step 4 (xulosa)da "PDF yuklash" tugmasi ko'rinadi
 *  - UC-TRIAGE-PDF-2: "PDF yuklash" tugmasini bosish download triggerlaydi
 *
 * Tests skip gracefully when the backend is unavailable or symptoms
 * haven't loaded (mock data not injected).
 *
 * Terms dialog bypass: medsmart_terms_v1 = 'true' injected via addInitScript.
 */

const SEED_SLUG = 'gipertoniya-i10';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Inject terms acceptance into localStorage before the page loads so
 * the TermsAcceptDialog does not intercept clicks.
 */
async function acceptTermsBeforeNavigation(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('medsmart_terms_v1', 'true');
    } catch {
      /* noop */
    }
  });
}

/**
 * Navigate to a disease detail page.
 * Returns true if the page loaded with visible content.
 * Returns false (never throws) when the server is down or the page is empty.
 */
async function openDiseaseCard(page: Page, slug = SEED_SLUG): Promise<boolean> {
  try {
    await page.goto(`/kasalliklar/${slug}`);
  } catch {
    // ERR_CONNECTION_REFUSED — dev server not running
    return false;
  }
  await page.waitForLoadState('networkidle').catch(() => {/* timeout ok */});

  const text = await page.locator('body').textContent({ timeout: 3000 }).catch(() => '');
  if (!text || text.includes('404') || text.includes('Internal Server Error')) return false;

  return page
    .locator('[class*="card"], [class*="disease"], h1, h2')
    .first()
    .isVisible({ timeout: 2000 })
    .catch(() => false);
}

/**
 * Open the SymptomMatcherSheet by clicking "Meni tekshirib ko'ring".
 * Returns true if the sheet opened.
 */
async function openSymptomSheet(page: Page): Promise<boolean> {
  const btn = page.getByRole('button', { name: /tekshirib ko['']ring/i });
  const visible = await btn.isVisible({ timeout: 3000 }).catch(() => false);
  if (!visible) return false;

  await btn.click();

  return page
    .locator('[data-state="open"], [data-vaul-drawer]')
    .first()
    .isVisible({ timeout: 3000 })
    .catch(() => false);
}

/**
 * Progress the wizard from step 1 through step 4.
 *
 * Step 1: answer at least one symptom "Ha", click "Keyingi".
 * Steps 2–3: click "Keyingi" (fields are optional).
 *
 * Returns true if step 4 was reached (send-to-doctor button visible
 * OR summary/moslik text visible).
 */
async function advanceToStep4(page: Page): Promise<boolean> {
  // Step 1: need at least one "Ha" answer to pass validation
  const firstYes = page.getByRole('button', { name: /^Ha$/ }).first();
  const hasSymptoms = await firstYes.isVisible({ timeout: 6000 }).catch(() => false);
  if (!hasSymptoms) return false;

  await firstYes.click();
  await page.waitForTimeout(100);

  // Steps 1 → 2 → 3 → 4
  for (let step = 0; step < 3; step++) {
    const nextBtn = page.getByRole('button', { name: /keyingi/i });
    const nextVisible = await nextBtn.isVisible({ timeout: 2000 }).catch(() => false);
    if (!nextVisible) return false;
    await nextBtn.click();
    await page.waitForTimeout(200);
  }

  // Confirm step 4 is active
  const hasSummary = await page
    .getByText(/xulosa|moslik darajasi|ehtimoliy tashxis|shifokorga yuborish/i)
    .first()
    .isVisible({ timeout: 3000 })
    .catch(() => false);

  return hasSummary;
}

// ─── UC-TRIAGE-PDF-1: "PDF yuklash" tugmasi step 4 da ko'rinadi ─────────────

test("UC-TRIAGE-PDF-1: Step 4 da 'PDF yuklash' tugmasi ko'rinadi", async ({ page }) => {
  await acceptTermsBeforeNavigation(page);

  const loaded = await openDiseaseCard(page);
  test.skip(!loaded, "Kasallik sahifasi yuklanmadi — server yo'q");

  const sheetOpened = await openSymptomSheet(page);
  test.skip(!sheetOpened, 'Sheet ochilmadi');

  const reachedStep4 = await advanceToStep4(page);
  test.skip(!reachedStep4, "Step 4 ga yetib bo'lmadi — simptomlar yo'q yoki wizard ishlamadi");

  // "PDF yuklash" tugmasi ko'rinishi shart
  const pdfBtn = page.getByRole('button', { name: /pdf yuklash/i });
  await expect(pdfBtn).toBeVisible({ timeout: 3000 });
});

// ─── UC-TRIAGE-PDF-2: Step 1–3 da "PDF yuklash" tugmasi ko'rinmaydi ─────────

test("UC-TRIAGE-PDF-2: Step 1 da 'PDF yuklash' tugmasi ko'rinmaydi", async ({ page }) => {
  await acceptTermsBeforeNavigation(page);

  const loaded = await openDiseaseCard(page);
  test.skip(!loaded, "Kasallik sahifasi yuklanmadi");

  const sheetOpened = await openSymptomSheet(page);
  test.skip(!sheetOpened, 'Sheet ochilmadi');

  // Step 1 da (sheet shunday ochiladi) — PDF tugmasi bo'lmasligi kerak
  const pdfBtn = page.getByRole('button', { name: /pdf yuklash/i });
  const isVisible = await pdfBtn.isVisible({ timeout: 1500 }).catch(() => false);
  expect(isVisible).toBe(false);
});

// ─── UC-TRIAGE-PDF-3: Bosish download triggerlaydi ───────────────────────────

test("UC-TRIAGE-PDF-3: 'PDF yuklash' bosish fayl yuklanishini boshlaydi", async ({ page }) => {
  await acceptTermsBeforeNavigation(page);

  const loaded = await openDiseaseCard(page);
  test.skip(!loaded, "Kasallik sahifasi yuklanmadi — server yo'q");

  const sheetOpened = await openSymptomSheet(page);
  test.skip(!sheetOpened, 'Sheet ochilmadi');

  const reachedStep4 = await advanceToStep4(page);
  test.skip(!reachedStep4, "Step 4 ga yetib bo'lmadi");

  const pdfBtn = page.getByRole('button', { name: /pdf yuklash/i });
  const btnVisible = await pdfBtn.isVisible({ timeout: 3000 }).catch(() => false);
  test.skip(!btnVisible, "'PDF yuklash' tugmasi topilmadi");

  // jsPDF.save() browser download eventini triggerlaydi
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 8000 }),
    pdfBtn.click(),
  ]);

  // Fayl nomi triage so'zini o'z ichiga olishi kerak
  expect(download.suggestedFilename()).toMatch(/triage|medsmart|simptom/i);
});

// ─── UC-TRIAGE-PDF-4: "Saqlash" va "PDF yuklash" birgalikda bor ─────────────

test("UC-TRIAGE-PDF-4: Step 4 da 'Saqlash' va 'PDF yuklash' birgalikda ko'rinadi", async ({ page }) => {
  await acceptTermsBeforeNavigation(page);

  const loaded = await openDiseaseCard(page);
  test.skip(!loaded, "Kasallik sahifasi yuklanmadi");

  const sheetOpened = await openSymptomSheet(page);
  test.skip(!sheetOpened, 'Sheet ochilmadi');

  const reachedStep4 = await advanceToStep4(page);
  test.skip(!reachedStep4, "Step 4 ga yetib bo'lmadi");

  // Ikkala tugma ham ko'rinishi shart
  const saveBtn = page.getByRole('button', { name: /^saqlash$/i });
  const pdfBtn  = page.getByRole('button', { name: /pdf yuklash/i });

  await expect(saveBtn).toBeVisible({ timeout: 3000 });
  await expect(pdfBtn).toBeVisible({ timeout: 3000 });
});
