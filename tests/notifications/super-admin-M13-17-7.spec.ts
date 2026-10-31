import { expect, test } from '@playwright/test';

test('M13-17-7 — Super Administrador — Editar plantilla de notificación', async ({ page }) => {
  test.setTimeout(60_000);
  const body = `Cuerpo QA M13-17-7 editado ${Date.now()} {{userName}}`;
  await page.goto('/NotificationTemplates/Edit/147dae22-a6e0-4a20-a063-66c828d83380');
  await page.locator('#body').fill(body);
  await page.getByRole('button', { name: /Guardar|Actualizar|Editar/i }).click();
  await expect(page.getByText('Plantilla actualizada correctamente')).toBeVisible();
  await expect(page.getByText(body, { exact: true })).toBeVisible();
});
