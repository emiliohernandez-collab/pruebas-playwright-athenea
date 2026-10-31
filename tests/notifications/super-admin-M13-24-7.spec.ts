import { expect, test } from '@playwright/test';

test('M13-24-7 — Super Administrador — Marcar todas como leídas', async ({ page }) => {
  test.setTimeout(45_000);
  await page.goto('/NotificationCenter');
  await expect(page.locator('body')).toContainText(/Notificaciones|notification/i);
  const markAll = page.locator('#markAllReadBtn');
  await expect(markAll).toBeVisible({ timeout: 20_000 });
  await markAll.click();
  const confirm = page.getByRole('button', { name: /Sí|mark|Todos/i }).last();
  await expect(confirm).toBeVisible();
  await confirm.click();
  await expect(page.locator('body')).toContainText(/No leído\s+0/i);
  await page.reload();
  await expect(page.locator('body')).toContainText(/No leído\s+0/i);
});
