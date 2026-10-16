import { test, expect } from '@playwright/test';
import { setupMockGuerrillaApi } from './helpers';

test.describe('TempMailer — OTP Auto-Extractor & Link Detector', () => {
  test('detects OTP code on inbox row and displays hero action card', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Mock GuerrillaMail API responses to simulate an incoming verification email
    await setupMockGuerrillaApi(page, {
      messages: [
        {
          mail_id: '99991',
          mail_from: 'accounts@service.com',
          mail_subject: 'Your confirmation code is 782049',
          mail_excerpt: 'Please enter 782049 to verify your account or visit https://service.com/confirm?token=xyz999',
          mail_date: '13:00',
          mail_body: '<p>Welcome! Your verification code is <strong>782049</strong>.</p><p><a href="https://service.com/confirm?token=xyz999">Click here to activate your account</a></p>',
        },
      ],
    });

    await page.goto('/');

    // Wait for the message to appear in the inbox list
    const messageRow = page.locator('text=accounts@service.com').first();
    await expect(messageRow).toBeVisible({ timeout: 10000 });

    // 1. Verify instant OTP badge on the list item row
    const rowOtpBadge = page.locator('text=Code: 782049');
    await expect(rowOtpBadge).toBeVisible();

    // 2. Test row-level "Copy Code" button
    const copyOtpRowBtn = page.getByRole('button', { name: /Copy Code/i }).first();
    await expect(copyOtpRowBtn).toBeVisible();
    await copyOtpRowBtn.click();
    await expect(page.locator('text=Copied!')).toBeVisible();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe('782049');

    // 3. Click the email to open message detail
    await page.locator('text=accounts@service.com').first().click();

    // 4. Verify Hero Action Card in detail view
    const heroCode = page.locator('span.font-mono.tracking-wider').locator('text=782049');
    await expect(heroCode).toBeVisible();

    // Verify verification link button
    const linkBtn = page.getByRole('link', { name: /Open Verification Link/i });
    await expect(linkBtn).toBeVisible();
    await expect(linkBtn).toHaveAttribute('href', 'https://service.com/confirm?token=xyz999');

    // 5. Test Copy Code inside Hero card
    const heroCopyBtn = page.getByRole('button', { name: /Copy Code/i }).last();
    await heroCopyBtn.click();
  });
});
