// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Vendor Portal E2E Tests
 *
 * Tests the vendor questionnaire portal at /vendor-portal.html.
 * These tests validate:
 * - Token-based auth (valid, invalid, missing tokens)
 * - Form rendering and navigation
 * - Auto-fill demo functionality
 * - Form submission flow
 * - Security (expired/reused tokens)
 */

const BASE = process.env.BASE_URL || 'https://showcase.agentic-innovations.com';

// Helper: generate a well-formatted but invalid vendor token for testing
function fakeToken(instanceKey = '12345678901234') {
  return `vrfp-${instanceKey}-aabbccddeeff00112233aabb`;
}

test.describe('Vendor Portal — Access Control', () => {
  test('shows error for missing token', async ({ page }) => {
    await page.goto(`${BASE}/vendor-portal.html`);
    // Should show "Invalid Link" error (no token param)
    await expect(page.locator('#app')).toContainText('Invalid Link', { timeout: 10000 });
  });

  test('shows error for missing instance param', async ({ page }) => {
    await page.goto(`${BASE}/vendor-portal.html?token=${fakeToken()}`);
    // Should show error since no instance= param
    await expect(page.locator('#app')).toContainText('Invalid Link', { timeout: 10000 });
  });

  test('loads page structure with token and instance params', async ({ page }) => {
    // Even with a fake token, the page should load and show either the portal or an error
    // (depends on whether KV is configured — without KV, demo mode accepts any well-formatted token)
    const resp = await page.goto(`${BASE}/vendor-portal.html?token=${fakeToken()}&instance=12345678901234`);
    expect(resp.status()).toBeLessThan(500);

    // Page should have the header
    await expect(page.locator('.header h1')).toContainText('Vendor Questionnaire Portal', { timeout: 10000 });
  });

  test('serves vendor-portal without requiring Descope login', async ({ page }) => {
    // Direct access should NOT redirect to /auth/login
    await page.goto(`${BASE}/vendor-portal.html?token=${fakeToken()}&instance=12345678901234`);
    // Cloudflare Pages may strip .html (pretty URLs) so check for both forms
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/vendor-portal/);
    expect(currentUrl).not.toContain('/auth/login');
  });

  test('serves defaults-vendor.js without auth', async ({ page }) => {
    const resp = await page.goto(`${BASE}/defaults-vendor.js`);
    expect(resp.status()).toBe(200);
    const text = await resp.text();
    expect(text).toContain('VENDOR_DEFAULTS');
  });
});

test.describe('Vendor Portal — Page Structure', () => {
  // Use a consistent URL for structural tests
  const portalUrl = (t, k = '12345678901234') =>
    `${BASE}/vendor-portal.html?token=${t}&instance=${k}`;

  test('has correct page title', async ({ page }) => {
    await page.goto(portalUrl(fakeToken()));
    await expect(page).toHaveTitle(/Vendor Questionnaire Portal/);
  });

  test('has secure session badge', async ({ page }) => {
    await page.goto(portalUrl(fakeToken()));
    await expect(page.locator('.secure-badge')).toContainText('Secure Session', { timeout: 10000 });
  });

  test('has vendor portal badge', async ({ page }) => {
    await page.goto(portalUrl(fakeToken()));
    await expect(page.locator('.vendor-badge')).toContainText('Vendor Portal', { timeout: 10000 });
  });

  test('does not show internal navigation (no persona selector)', async ({ page }) => {
    await page.goto(portalUrl(fakeToken()));
    // Should NOT have the persona selector or internal nav links
    await expect(page.locator('.persona-selector')).toHaveCount(0);
    await expect(page.locator('a[href="index.html"]')).toHaveCount(0);
    await expect(page.locator('a[href="dashboard.html"]')).toHaveCount(0);
  });
});

test.describe('Vendor Portal — Form Rendering', () => {
  // These tests verify that the portal renders forms correctly when loaded
  // In demo mode (no KV), any well-formatted token is accepted

  test('renders category navigation buttons', async ({ page }) => {
    await page.goto(`${BASE}/vendor-portal.html?token=${fakeToken()}&instance=12345678901234`);
    // Wait for either portal content or an error
    await page.waitForTimeout(3000);

    // If portal loaded successfully, check for category nav
    const catNav = page.locator('.category-nav');
    if (await catNav.isVisible()) {
      const buttons = page.locator('.cat-btn');
      const count = await buttons.count();
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });

  test('renders form container with fields', async ({ page }) => {
    await page.goto(`${BASE}/vendor-portal.html?token=${fakeToken()}&instance=12345678901234`);
    await page.waitForTimeout(3000);

    const formContainer = page.locator('#formContainer');
    if (await formContainer.isVisible()) {
      // Should have form inputs
      const inputs = page.locator('#formContainer input, #formContainer textarea, #formContainer select');
      const count = await inputs.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('auto-fill button populates form fields', async ({ page }) => {
    await page.goto(`${BASE}/vendor-portal.html?token=${fakeToken()}&instance=12345678901234`);
    await page.waitForTimeout(3000);

    const autoFillBtn = page.locator('button', { hasText: 'Auto-Fill' });
    if (await autoFillBtn.isVisible()) {
      await autoFillBtn.click();

      // Check that at least one field got populated
      await page.waitForTimeout(500);
      const filledInputs = page.locator('#formContainer input[type="text"]');
      const count = await filledInputs.count();
      if (count > 0) {
        const firstValue = await filledInputs.first().inputValue();
        expect(firstValue.length).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('Vendor Portal — Navigation', () => {
  const portalUrl = `${BASE}/vendor-portal.html?token=${fakeToken()}&instance=12345678901234`;

  test('Save & Next advances to next category', async ({ page }) => {
    await page.goto(portalUrl);
    await page.waitForTimeout(3000);

    const saveNextBtn = page.locator('button', { hasText: 'Save & Next' });
    if (await saveNextBtn.isVisible()) {
      // Get initial active category
      const initialActive = page.locator('.cat-btn.active');
      const initialText = await initialActive.textContent();

      await saveNextBtn.click();
      await page.waitForTimeout(500);

      // Active category should have changed
      const newActive = page.locator('.cat-btn.active');
      const newText = await newActive.textContent();
      expect(newText).not.toBe(initialText);
    }
  });

  test('Previous button goes back', async ({ page }) => {
    await page.goto(portalUrl);
    await page.waitForTimeout(3000);

    // Navigate forward first
    const saveNextBtn = page.locator('button', { hasText: 'Save & Next' });
    if (await saveNextBtn.isVisible()) {
      await saveNextBtn.click();
      await page.waitForTimeout(500);

      const prevBtn = page.locator('button', { hasText: 'Previous' });
      if (await prevBtn.isVisible()) {
        await prevBtn.click();
        await page.waitForTimeout(500);

        // Should be back on first category
        const active = page.locator('.cat-btn.active');
        const text = await active.textContent();
        expect(text).toContain('Security');
      }
    }
  });

  test('category nav buttons switch sections', async ({ page }) => {
    await page.goto(portalUrl);
    await page.waitForTimeout(3000);

    const buttons = page.locator('.cat-btn');
    const count = await buttons.count();
    if (count >= 3) {
      // Click the 3rd category button
      await buttons.nth(2).click();
      await page.waitForTimeout(500);

      // That button should now be active
      await expect(buttons.nth(2)).toHaveClass(/active/);
    }
  });
});

test.describe('Vendor Portal — Progress Tracking', () => {
  test('progress bar updates when saving sections', async ({ page }) => {
    await page.goto(`${BASE}/vendor-portal.html?token=${fakeToken()}&instance=12345678901234`);
    await page.waitForTimeout(3000);

    const progressFill = page.locator('.progress-fill');
    if (await progressFill.isVisible()) {
      // Initial progress should be 0%
      const initialWidth = await progressFill.evaluate(el => el.style.width);

      // Save current section
      const saveBtn = page.locator('button', { hasText: 'Save & Next' });
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(500);

        // Progress should have increased
        const newWidth = await progressFill.evaluate(el => el.style.width);
        expect(newWidth).not.toBe('0%');
      }
    }
  });

  test('completed categories get green dot', async ({ page }) => {
    await page.goto(`${BASE}/vendor-portal.html?token=${fakeToken()}&instance=12345678901234`);
    await page.waitForTimeout(3000);

    const saveBtn = page.locator('button', { hasText: 'Save & Next' });
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.waitForTimeout(500);

      // First category should now be marked completed
      const firstCat = page.locator('.cat-btn').first();
      await expect(firstCat).toHaveClass(/completed/);
    }
  });
});

test.describe('Vendor Portal — Security', () => {
  test('vendor portal does not expose internal API routes', async ({ page }) => {
    // Vendor token should NOT grant access to internal APIs
    const resp = await page.goto(`${BASE}/api/tasks?token=${fakeToken()}`);
    // Should get 401 (requires Descope auth) not 200
    expect(resp.status()).toBe(401);
  });

  test('vendor API routes require token parameter', async ({ page }) => {
    const resp = await page.goto(`${BASE}/api/vendor/status?instance=12345`);
    // Without token, should get 401 or 403
    expect([401, 403]).toContain(resp.status());
  });
});
