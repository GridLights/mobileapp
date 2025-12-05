// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/settings');
  });

  test('should display settings header', async ({ page }) => {
    await expect(page.locator('.header-title')).toContainText('SETTINGS');
  });

  test('should display Network and Device tabs', async ({ page }) => {
    await expect(page.locator('.q-tab').filter({ hasText: 'Network' })).toBeVisible();
    await expect(page.locator('.q-tab').filter({ hasText: 'Device' })).toBeVisible();
  });

  test('should show Network tab content by default', async ({ page }) => {
    await expect(page.locator('text=Wi-Fi / Network Settings')).toBeVisible();
  });

  test('should switch to Device tab when clicked', async ({ page }) => {
    // Click on Device tab
    await page.locator('.q-tab').filter({ hasText: 'Device' }).click();

    // Verify Device tab content is visible
    await expect(page.locator('text=Connection Settings')).toBeVisible();
    await expect(page.locator('text=IP Address')).toBeVisible();
  });

  test('should switch back to Network tab when clicked', async ({ page }) => {
    // First switch to Device tab
    await page.locator('.q-tab').filter({ hasText: 'Device' }).click();
    await expect(page.locator('text=Connection Settings')).toBeVisible();

    // Switch back to Network tab
    await page.locator('.q-tab').filter({ hasText: 'Network' }).click();
    await expect(page.locator('text=Wi-Fi / Network Settings')).toBeVisible();
  });

  test('should navigate back when back arrow is clicked', async ({ page }) => {
    await page.locator('.header-icon.left-icon').click();
    await expect(page).toHaveURL(/#\/$/);
  });
});
