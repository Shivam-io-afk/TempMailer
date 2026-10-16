import { test, expect } from '@playwright/test';
import { setupMockGuerrillaApi } from './helpers';

test.describe('TempMailer — Disposable @gmail.com Inbox & OTP Reception', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockGuerrillaApi(page);
  });

  test('adds a disposable @gmail.com inbox to vault without personal login', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/');

    // Wait for initial mailbox
    const addressDisplay = page.locator('span.font-mono.font-bold').first();
    await expect(addressDisplay).toBeVisible({ timeout: 10000 });
    const initialAddress = await addressDisplay.innerText();

    // Click "+ Add Gmail" button in vault toolbar
    const addGmailBtn = page.getByRole('button', { name: /\+ Add Gmail/i });
    await expect(addGmailBtn).toBeVisible();
    await addGmailBtn.click();

    // Vault should now have 2 mailboxes
    await expect(page.locator('text=Active Inboxes (2/5):')).toBeVisible({ timeout: 10000 });

    // Active address must end with @gmail.com
    await expect(addressDisplay).toContainText('@gmail.com');
    const gmailAddress = await addressDisplay.innerText();
    expect(gmailAddress).not.toBe(initialAddress);

    // Verify Gmail Protected badge in the header
    await expect(page.locator('text=Disposable Gmail Account (@gmail.com)')).toBeVisible();
    await expect(page.locator('text=Gmail Protected • Ready for OTP')).toBeVisible();

    // Verify incoming OTP message is parsed and visible in message list
    const otpMessageRow = page.locator('text=749201 is your Google verification code').first();
    await expect(otpMessageRow).toBeVisible({ timeout: 10000 });

    // Row-level quick copy badge
    const rowOtpBadge = page.locator('text=Code: 749201');
    await expect(rowOtpBadge).toBeVisible();

    // Test row-level copy code button
    const copyOtpBtn = page.getByRole('button', { name: /Copy Code/i }).first();
    await copyOtpBtn.click();
    await expect(page.locator('text=Copied!')).toBeVisible();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe('749201');

    // Click to view message detail
    await otpMessageRow.click();

    // Hero Action Card in message detail
    const heroCode = page.locator('span.font-mono.tracking-wider').locator('text=749201');
    await expect(heroCode).toBeVisible();

    // Switch back to Mailbox #1 (Guerrilla)
    const pill1 = page.locator('div[class*="group px-3 py-1"]').first();
    await pill1.click();
    await expect(addressDisplay).toHaveText(initialAddress);

    // Switch back to Mailbox #2 (Gmail)
    const pill2 = page.locator('div[class*="group px-3 py-1"]').nth(1);
    await pill2.click();
    await expect(addressDisplay).toHaveText(gmailAddress);
  });

  test('customizes username and selects @gmail.com via Change Address modal', async ({ page }) => {
    await page.goto('/');

    const changeBtn = page.getByRole('button', { name: /Change/i }).first();
    await expect(changeBtn).toBeVisible({ timeout: 10000 });
    await changeBtn.click();

    // Fill in custom username with dots
    const usernameInput = page.locator('input[placeholder*="shivam99"]');
    await expect(usernameInput).toBeVisible();
    await usernameInput.fill('shivam.verify99');

    // Select @gmail.com domain
    const domainSelect = page.locator('select');
    await domainSelect.selectOption('gmail.com');

    // Verify preview contains @gmail.com
    await expect(page.locator('text=shivam.verify99@gmail.com')).toBeVisible();

    // Save
    const saveBtn = page.getByRole('button', { name: /Save & Change/i });
    await saveBtn.click();

    // Modal should close
    await expect(page.locator('text=Change Email Address')).not.toBeVisible();

    // Active address should be updated
    const addressDisplay = page.locator('span.font-mono.font-bold').first();
    await expect(addressDisplay).toHaveText('shivam.verify99@gmail.com');
    await expect(page.locator('text=Gmail Protected • Ready for OTP')).toBeVisible();
  });
});
