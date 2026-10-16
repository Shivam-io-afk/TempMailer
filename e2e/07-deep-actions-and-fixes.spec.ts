import { test, expect } from '@playwright/test';
import { setupMockGuerrillaApi } from './helpers';

test.describe('TempMailer — Deep Actions & Edge Case Bug Regression Tests', () => {
  test('BUG-003: Deleting a mailbox updates vault without leaving phantom pills', async ({ page }) => {
    await setupMockGuerrillaApi(page);
    await page.goto('/');

    // Wait for initial mailbox
    const addressDisplay = page.locator('span.font-mono.font-bold').first();
    await expect(addressDisplay).toBeVisible({ timeout: 10000 });
    const initialAddress = await addressDisplay.innerText();

    // Add a second inbox
    await page.getByRole('button', { name: /Add Inbox/i }).click();
    await expect(page.locator('text=Active Inboxes (2/5):')).toBeVisible({ timeout: 10000 });

    const secondAddress = await addressDisplay.innerText();
    expect(secondAddress).not.toBe(initialAddress);

    // Delete active mailbox (secondAddress)
    const deleteBtn = page.locator('button[title*="Delete mailbox"]').first();
    await deleteBtn.click();

    // Vault count should drop back to 1/5
    await expect(page.locator('text=Active Inboxes (1/5):')).toBeVisible({ timeout: 10000 });

    // Active mailbox should switch back to initialAddress
    await expect(addressDisplay).toHaveText(initialAddress);
  });

  test('BUG-004: ChangeAddressModal synchronizes with active address after switching mailboxes', async ({ page }) => {
    await setupMockGuerrillaApi(page);
    await page.goto('/');

    const addressDisplay = page.locator('span.font-mono.font-bold').first();
    await expect(addressDisplay).toBeVisible({ timeout: 10000 });
    const firstAddress = await addressDisplay.innerText();

    // Open change modal on mailbox #1
    await page.getByRole('button', { name: /Change/i }).first().click();
    const usernameInput = page.locator('input[placeholder*="shivam99"]');
    await expect(usernameInput).toHaveValue(firstAddress.split('@')[0]);
    await page.getByRole('button', { name: /Cancel/i }).click();

    // Add inbox #2
    await page.getByRole('button', { name: /Add Inbox/i }).click();
    await expect(page.locator('text=Active Inboxes (2/5):')).toBeVisible({ timeout: 10000 });
    const secondAddress = await addressDisplay.innerText();

    // Open change modal on mailbox #2
    await page.getByRole('button', { name: /Change/i }).first().click();
    // Should now contain secondAddress prefix, NOT firstAddress!
    await expect(usernameInput).toHaveValue(secondAddress.split('@')[0]);
    await page.getByRole('button', { name: /Cancel/i }).click();
  });

  test('BUG-006: Mobile view navigation never traps user on empty detail screen', async ({ page }) => {
    await setupMockGuerrillaApi(page);
    // Set viewport to mobile iPhone SE
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Wait for initial mailbox
    await expect(page.locator('span.font-mono.font-bold').first()).toBeVisible({ timeout: 10000 });

    // Add inbox #2 while on mobile
    await page.getByRole('button', { name: /Add Inbox/i }).click();
    await expect(page.locator('text=Active Inboxes (2/5):')).toBeVisible({ timeout: 10000 });

    // Switch back to inbox #1
    const pill1 = page.locator('div[class*="group px-3 py-1"]').first();
    await pill1.click();

    // The message list inbox header should be visible on mobile
    await expect(page.locator('span:has-text("Inbox")').first()).toBeVisible();
  });

  test('BUG-007: DOMPurify forces target="_blank" and rel="noopener noreferrer" on email HTML links', async ({ page }) => {
    // Setup mock with targeted HTML link message
    await setupMockGuerrillaApi(page, {
      messages: [
        {
          mail_id: '8888',
          mail_from: 'security@example.com',
          mail_subject: 'Confirm your account now',
          mail_excerpt: 'Click the link to activate',
          mail_date: '14:00',
          mail_body: '<p>Please <a href="https://example.com/confirm">click this link</a> to verify.</p>',
        },
      ],
    });

    await page.goto('/');

    // Click message to view detail
    const msg = page.locator('text=security@example.com').first();
    await expect(msg).toBeVisible({ timeout: 10000 });
    await msg.click();

    // Verify sanitized link inside email body
    const bodyLink = page.locator('.prose a[href="https://example.com/confirm"]');
    await expect(bodyLink).toBeVisible();
    await expect(bodyLink).toHaveAttribute('target', '_blank');
    await expect(bodyLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('BUG-005: Title alert uses TempMailer branding and restores accurately', async ({ page }) => {
    await setupMockGuerrillaApi(page);
    await page.goto('/');

    await page.evaluate(() => {
      // Trigger document title alert from client
      window.dispatchEvent(new Event('blur'));
    });

    // Verify page title still contains TempMailer
    await expect(page).toHaveTitle(/TempMailer/);
  });
});
