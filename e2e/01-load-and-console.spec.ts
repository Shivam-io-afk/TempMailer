import { test, expect } from '@playwright/test';
import { setupMockGuerrillaApi } from './helpers';

test.describe('TempMailer — Initial Load & UI Health', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockGuerrillaApi(page);
  });

  test('loads without console errors or unhandled rejections', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    await page.goto('/');

    // Verify Title & Header
    await expect(page).toHaveTitle(/TempMailer/);
    await expect(page.locator('header')).toContainText('TempMailer');
    await expect(page.locator('header')).toContainText('Instant OTP');

    // Wait for the address to be generated and displayed (address contains @)
    const addressDisplay = page.locator('span.font-mono.font-bold').first();
    await expect(addressDisplay).toBeVisible({ timeout: 10000 });
    await expect(addressDisplay).toContainText('@');

    // Verify listening badge
    await expect(page.locator('text=Active & Ready for OTP')).toBeVisible();

    // Verify 0 runtime page errors
    expect(consoleErrors).toEqual([]);
  });

  test('toggles dark and light themes smoothly', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const themeBtn = page.locator('button[aria-label="Toggle theme"]');

    // Check initial state
    const isInitiallyDark = await html.evaluate((el) => el.classList.contains('dark'));

    // Toggle theme
    await themeBtn.click();
    if (isInitiallyDark) {
      await expect(html).not.toHaveClass(/dark/);
    } else {
      await expect(html).toHaveClass(/dark/);
    }

    // Toggle back
    await themeBtn.click();
    if (isInitiallyDark) {
      await expect(html).toHaveClass(/dark/);
    } else {
      await expect(html).not.toHaveClass(/dark/);
    }
  });
});
