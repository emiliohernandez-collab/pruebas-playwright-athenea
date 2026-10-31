import { expect, test } from '@playwright/test';

test('M13-22-7 — Super Administrador — Actualizar notificación propia', async ({ page }) => {
  test.setTimeout(45_000);
  await page.goto('/NotificationCenter');
  await expect(page.locator('body')).toContainText(/Notificaciones|notification/i);
  const menu = page.locator('button.dropdown-toggle').filter({ has: page.locator('i.mdi-dots-horizontal') }).first();
  await expect(menu).toBeVisible({ timeout: 20_000 });
  await menu.click();
  const action = page.locator('.dropdown-menu.show a.mark-read-btn').first();
  await expect(action).toBeVisible();
  await action.click();
  await page.reload();
  await expect(page.locator('body')).toContainText(/Centro de Notificaciones|Notificaciones/i);
});
