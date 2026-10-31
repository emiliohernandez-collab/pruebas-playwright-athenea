import { expect, test } from '@playwright/test';

test('M13-25-7 — Super Administrador — Eliminar notificación propia', async ({ page }) => {
  test.setTimeout(45_000);
  await page.goto('/NotificationCenter');
  await expect(page.locator('body')).toContainText(/Centro de Notificaciones|Notificaciones/i);
  const allFilter = page.getByText('Todos', { exact: true }).first();
  if (await allFilter.count()) await allFilter.click();
  const menu = page.locator('button.dropdown-toggle').filter({ has: page.locator('i.mdi-dots-horizontal') }).first();
  await expect(menu).toBeVisible({ timeout: 20_000 });
  await menu.click();
  const remove = page.locator('.dropdown-menu.show a').filter({ hasText: /Eliminar/i }).first();
  await expect(remove).toBeVisible();
  page.once('dialog', async dialog => { await dialog.accept(); });
  await remove.click();
  const confirm = page.getByRole('button', { name: /Sí|Eliminar|Confirmar/i }).last();
  if (await confirm.isVisible().catch(() => false)) await confirm.click();
  await expect(page.locator('.dropdown-menu.show')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('body')).toContainText(/Centro de Notificaciones|Notificaciones/i);
});
