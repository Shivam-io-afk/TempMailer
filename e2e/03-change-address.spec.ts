import { test, expect } from '@playwright/test';

test.describe('TempMailer — Change Address & Custom Domain', () => {
  test('customizes username and domain via ChangeAddressModal', async ({ page }) => {
    await page.goto('/');

    const changeBtn = page.getByRole('button', { name: /Change/i }).first();
    await expect(changeBtn).toBeVisible({ timeout: 10000 });
    await changeBtn.click();

    // Verify modal is open
    await expect(page.locator('text=Change Email Address')).toBeVisible();

    const usernameInput = page.locator('input[placeholder*="shivam99"]');
    await expect(usernameInput).toBeVisible();

    // Clear and type new username
    await usernameInput.fill('pwtestotp');

    // Select sharklasers.com domain
    const domainSelect = page.locator('select');
    await domainSelect.selectOption('sharklasers.com');

    // Verify preview
    await expect(page.locator('text=pwtestotp@sharklasers.com')).toBeVisible();

    // Submit
    const saveBtn = page.getByRole('button', { name: /Save & Change/i });
    await saveBtn.click();

    // Modal should close
    await expect(page.locator('text=Change Email Address')).not.toBeVisible();

    // Hero address should now display pwtestotp@sharklasers.com
    const mainAddress = page.locator('span.font-mono.font-bold').first();
    await expect(mainAddress).toContainText('pwtestotp@sharklasers.com');
  });

  test('generates random username and domain inside modal', async ({ page }) => {
    await page.goto('/');

    const changeBtn = page.getByRole('button', { name: /Change/i }).first();
    await expect(changeBtn).toBeVisible({ timeout: 10000 });
    await changeBtn.click();

    const usernameInput = page.locator('input[placeholder*="shivam99"]');
    const initialValue = await usernameInput.inputValue();

    // Click Random button
    const randomBtn = page.getByRole('button', { name: /Random/i });
    await randomBtn.click();

    const newValue = await usernameInput.inputValue();
    expect(newValue).not.toBe('');
    expect(newValue).not.toBe(initialValue);

    // Cancel modal
    await page.getByRole('button', { name: /Cancel/i }).click();
    await expect(page.locator('text=Change Email Address')).not.toBeVisible();
  });
});

