import { expect, test } from '@playwright/test';

test('M13-18-7 — Super Administrador — Eliminar plantilla de notificación', async ({ page }) => {
  test.setTimeout(60_000);
  const name = `QA M13-18-7 ${Date.now()}`;
  await page.goto('/NotificationTemplates/Create');
  await page.locator('#name').fill(name);
  await page.locator('#description').fill('Fixture temporal para eliminación QA');
  await page.locator('#category').fill('QA');
  await page.locator('#subject').fill('Asunto temporal M13-18-7');
  await page.locator('#body').fill('Cuerpo temporal M13-18-7');
  await page.locator('#isActive').click();
  await page.getByRole('button', { name: /Crear plantilla/i }).click();
  await expect(page.getByText('Plantilla creada correctamente')).toBeVisible();
  await expect(page.getByText(name, { exact: true })).toBeVisible();

  page.once('dialog', dialog => dialog.accept());
  await page.getByText(name, { exact: true }).locator('xpath=following::a[contains(@href,"/NotificationTemplates/Edit/")][1]').click();
  await page.goto('/NotificationTemplates/Index');
  const card = page.getByText(name, { exact: true }).locator('xpath=ancestor::div[.//a[contains(@href,"/NotificationTemplates/Edit/")]][1]');
  await card.locator('button[onclick*="deleteTemplate"]').click();
  await expect(page.getByText(name, { exact: true })).toHaveCount(0);
});
