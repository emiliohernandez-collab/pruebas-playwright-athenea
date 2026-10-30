import { expect, test } from '@playwright/test';

test('M13-16-7 — Super Administrador — Crear plantilla de notificación', async ({ page }) => {
  test.setTimeout(60_000);
  const name = `QA M13-16-7 ${Date.now()}`;
  await page.goto('/NotificationTemplates/Create');
  await page.locator('#name').fill(name);
  await page.locator('#description').fill('Fixture automatizada de creación de plantilla');
  await page.locator('#category').fill('QA');
  await page.locator('#subject').fill('Asunto QA M13-16-7');
  await page.locator('#body').fill('Cuerpo QA M13-16-7 {{userName}}');
  await page.locator('#availableVariables').fill('userName');
  await page.locator('#isActive').click();
  await page.getByRole('button', { name: /Crear plantilla/i }).click();
  await expect(page.getByText('Plantilla creada correctamente')).toBeVisible();
  await expect(page.getByText(name, { exact: true })).toBeVisible();
});
