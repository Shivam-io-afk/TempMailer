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
    const otpMessageRow = page.locator('text=/\\d{6} is your Google verification code/').first();
    await expect(otpMessageRow).toBeVisible({ timeout: 10000 });

    // Row-level quick copy badge with dynamic OTP
    const rowOtpBadge = page.locator('text=/Code: \\d{6}/').first();
    await expect(rowOtpBadge).toBeVisible();

    // Verify Sender Origin is clearly displayed on the OTP badge
    const originBadge = page.locator('text=From: Google').first();
    await expect(originBadge).toBeVisible();

    // Test row-level copy code button
    const copyOtpBtn = page.getByRole('button', { name: /Copy Code/i }).first();
    await copyOtpBtn.click();
    await expect(page.locator('text=Copied!')).toBeVisible();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toMatch(/^\d{6}$/);

    // Click to view message detail
    await otpMessageRow.click();

    // Hero Action Card in message detail with dynamic code and origin badge
    const heroCode = page.locator('span.font-mono.tracking-wider').locator(`text=${clipboardText}`);
    await expect(heroCode).toBeVisible();

    // Verify origin indicator inside Hero card
    const heroOrigin = page.locator('div[class*="from-amber-500/10"]').getByText('Google', { exact: true });
    await expect(heroOrigin).toBeVisible();

    // Switch back to Mailbox #1 (Guerrilla)
    const pill1 = page.locator('div[class*="group px-3 py-1"]').first();
    await pill1.click();
    await expect(addressDisplay).toHaveText(initialAddress);

    // Switch back to Mailbox #2 (Gmail)
    const pill2 = page.locator('div[class*="group px-3 py-1"]').nth(1);
    await pill2.click();
    await expect(addressDisplay).toHaveText(gmailAddress);
  });

  test('generates fresh, unique non-repeating OTP codes and displays origin when Send Test OTP is clicked', async ({ page }) => {
    await page.goto('/');

    // Wait for mailbox to be ready
    const addressDisplay = page.locator('span.font-mono.font-bold').first();
    await expect(addressDisplay).toBeVisible({ timeout: 10000 });

    // Click "+ Add Gmail"
    const addGmailBtn = page.getByRole('button', { name: /\+ Add Gmail/i });
    await addGmailBtn.click();
    await expect(addressDisplay).toContainText('@gmail.com');

    // Get the initial OTP code from the seeded messages
    const initialBadge = page.locator('text=/Code: \\d{6}/').first();
    await expect(initialBadge).toBeVisible({ timeout: 10000 });
    const initialBadgeText = await initialBadge.innerText();

    // Click "Send Test OTP"
    const sendTestOtpBtn = page.getByRole('button', { name: /Send Test OTP|Test OTP/i });
    await expect(sendTestOtpBtn).toBeVisible();
    await sendTestOtpBtn.click();

    // An incoming message should appear at the top with a new OTP
    const latestBadge = page.locator('text=/Code: \\d{6}/').first();
    await expect(latestBadge).toBeVisible();
    const latestBadgeText = await latestBadge.innerText();

    // The new OTP code must NOT be the same as the previous one
    expect(latestBadgeText).not.toBe(initialBadgeText);

    // The new message should show origin info
    const latestRow = page.locator('div[class*="divide-y"] > div').first();
    await expect(latestRow.locator('text=/From: (Google|Netflix|Discord|Spotify|Amazon|GitHub|Instagram|Steam|OpenAI|Telegram|Service)/')).toBeVisible();

    // Click Send Test OTP again to verify a second fresh code is received
    await sendTestOtpBtn.click();
    const secondBadge = page.locator('text=/Code: \\d{6}/').first();
    const secondBadgeText = await secondBadge.innerText();
    expect(secondBadgeText).not.toBe(latestBadgeText);
    expect(secondBadgeText).not.toBe(initialBadgeText);
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

