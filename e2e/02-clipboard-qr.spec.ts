import { test, expect } from '@playwright/test';

test.describe('TempMailer — Copy & QR Code Modal', () => {
  test('copies email address to clipboard and displays feedback', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/');

    const copyBtn = page.getByRole('button', { name: /Copy Address/i });
    await expect(copyBtn).toBeVisible({ timeout: 10000 });

    // Click copy
    await copyBtn.click();

    // Verify feedback state changes to "Copied to Clipboard!"
    await expect(page.locator('text=Copied to Clipboard!')).toBeVisible();

    // Verify clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('@');
  });

  test('opens and closes QR Code modal', async ({ page }) => {
    await page.goto('/');

    const qrBtn = page.locator('button[title*="QR Code"]');
    await expect(qrBtn).toBeVisible({ timeout: 10000 });
    await qrBtn.click();

    // QR modal should be visible
    await expect(page.locator('text=Scan Disposable Email')).toBeVisible();
    const qrImage = page.locator('img[alt*="QR code for"]');
    await expect(qrImage).toBeVisible();

    // Close button
    const closeBtn = page.locator('div.fixed button').first();
    await closeBtn.click();

    // Modal should disappear
    await expect(page.locator('text=Scan Disposable Email')).not.toBeVisible();
  });
});

