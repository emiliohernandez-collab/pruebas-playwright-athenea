import { expect, test } from '@playwright/test';

test('M13-19-7 — Super Administrador — Activar o desactivar plantilla', async ({ page }) => {
  test.setTimeout(60_000);
  const name = `QA M13-19-7 ${Date.now()}`;
  await page.goto('/NotificationTemplates/Create');
  await page.locator('#name').fill(name);
  await page.locator('#description').fill('Fixture para activar y desactivar plantilla');
  await page.locator('#category').fill('QA');
  await page.locator('#subject').fill('Asunto QA M13-19-7');
  await page.locator('#body').fill('Cuerpo QA M13-19-7');
  await page.locator('#isActive').click();
  await page.getByRole('button', { name: /Crear plantilla/i }).click();
  await expect(page.getByText('Plantilla creada correctamente')).toBeVisible();

  let card = page.getByText(name, { exact: true }).locator('xpath=ancestor::div[.//a[contains(@href,"/NotificationTemplates/Edit/")]][1]');
  await card.locator('button[onclick*="toggleActive"]').click();
  await page.waitForTimeout(1_500);
  await page.reload();
  card = page.getByText(name, { exact: true }).locator('xpath=ancestor::div[.//a[contains(@href,"/NotificationTemplates/Edit/")]][1]');
  await expect(card).toContainText('Inactivo');

  await card.locator('button[onclick*="toggleActive"]').click();
  await page.waitForTimeout(700);
  await page.reload();
  card = page.getByText(name, { exact: true }).locator('xpath=ancestor::div[.//a[contains(@href,"/NotificationTemplates/Edit/")]][1]');
  await expect(card).toContainText('Activo');
});
