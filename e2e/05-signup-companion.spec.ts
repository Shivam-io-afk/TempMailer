import { test, expect } from '@playwright/test';

test.describe('TempMailer — Signup Companion Toolkit', () => {
  test('generates secure passwords and fake test personas', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/');

    // Open toolkit
    const toolkitBtn = page.getByRole('button', { name: /Signup Companion/i });
    await expect(toolkitBtn).toBeVisible();
    await toolkitBtn.click();

    // Verify modal visible
    await expect(page.locator('text=Signup Companion Toolkit')).toBeVisible();

    // Check password display
    const passwordBox = page.locator('div.select-all').first();
    await expect(passwordBox).toBeVisible();
    const initialPassword = (await passwordBox.innerText()).trim();
    expect(initialPassword.length).toBe(16);

    // Adjust length slider to 24
    const slider = page.locator('input[type="range"]');
    await slider.fill('24');
    const len24Password = (await passwordBox.innerText()).trim();
    expect(len24Password.length).toBe(24);

    // Copy password
    const copyPassBtn = page.locator('button[title="Copy password"]');
    await copyPassBtn.click();

    const clipboardPass = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardPass).toBe(len24Password);

    // Persona Section
    const nameDisplay = page.locator('span:has-text("Full Name") ~ span');
    await expect(nameDisplay).toBeVisible();
    const initialName = (await nameDisplay.innerText()).trim();
    expect(initialName.length).toBeGreaterThan(3);

    // Generate fresh persona
    const regenPersonaBtn = page.getByRole('button', { name: /New Identity/i });
    await regenPersonaBtn.click();
    const newName = (await nameDisplay.innerText()).trim();
    expect(newName).not.toBe(initialName);

    // Close modal
    const closeBtn = page.locator('div.fixed button').first();
    await closeBtn.click();
    await expect(page.locator('text=Signup Companion Toolkit')).not.toBeVisible();
  });
});
