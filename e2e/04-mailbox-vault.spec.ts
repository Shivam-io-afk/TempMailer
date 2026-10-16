import { test, expect } from '@playwright/test';

test.describe('TempMailer — Multi-Mailbox Vault Switcher', () => {
  test('adds additional mailboxes and switches between them', async ({ page }) => {
    await page.goto('/');

    // Wait for initial mailbox
    const addressDisplay = page.locator('span.font-mono.font-bold').first();
    await expect(addressDisplay).toBeVisible({ timeout: 10000 });
    const firstAddress = await addressDisplay.innerText();

    // Verify initial vault pill #1
    await expect(page.locator('text=Active Inboxes (1/5):')).toBeVisible();

    // Click "+ Add Inbox"
    const addInboxBtn = page.getByRole('button', { name: /Add Inbox/i });
    await expect(addInboxBtn).toBeVisible();
    await addInboxBtn.click();

    // Vault should now have 2 mailboxes
    await expect(page.locator('text=Active Inboxes (2/5):')).toBeVisible({ timeout: 10000 });

    // The current active address should be different from the first address
    await expect(addressDisplay).not.toHaveText(firstAddress);
    const secondAddress = await addressDisplay.innerText();

    // Click pill #1 to switch back
    const pill1 = page.locator('div[class*="group px-3 py-1"]').first();
    await pill1.click();

    // Address should switch back to firstAddress
    await expect(addressDisplay).toHaveText(firstAddress);

    // Click pill #2 to switch forward
    const pill2 = page.locator('div[class*="group px-3 py-1"]').nth(1);
    await pill2.click();

    await expect(addressDisplay).toHaveText(secondAddress);
  });
});

