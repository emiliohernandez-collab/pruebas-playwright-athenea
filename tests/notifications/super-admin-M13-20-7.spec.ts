import { expect, test } from '@playwright/test';

test('M13-20-7 — Super Administrador — Vista previa de plantilla', async ({ page }) => {
  test.setTimeout(60_000);
  const name = `QA M13-20-7 ${Date.now()}`;
  await page.goto('/NotificationTemplates/Create');
  await page.locator('#name').fill(name);
  await page.locator('#description').fill('Plantilla temporal para validar vista previa.');
  await page.locator('#notificationType').selectOption({ label: 'Email' });
  await page.locator('#category').fill('QA');
  await page.locator('#language').selectOption({ label: 'Español' });
  await page.locator('#defaultPriority').selectOption({ label: 'Normal' });
  await page.locator('#subject').fill('Vista previa QA {{userName}}');
  await page.locator('#body').fill('Hola {{userName}}, esta es una vista previa de prueba.');
  await page.getByRole('button', { name: /Crear plantilla/i }).click();
  await expect(page.locator('body')).toContainText(/creada|éxito|correctamente/i);

  await page.goto('/NotificationTemplates');
  const title = page.getByText(name, { exact: true });
  await expect(title).toBeVisible();
  const card = title.locator('xpath=ancestor::div[contains(@class, "card")][1]');
  await card.getByText('Editar', { exact: true }).click();
  await expect(page).toHaveURL(/NotificationTemplates\/Edit/i);
  await page.getByRole('button', { name: /Vista previa|Preview/i }).click();
  await expect(page.locator('body')).toContainText(/vista previa|Hola|datos de ejemplo|Vista previa QA/i);

  await page.goto('/NotificationTemplates');
  const cleanup = page.getByText(name, { exact: true }).locator('xpath=ancestor::div[contains(@class, "card")][1]');
  page.once('dialog', async dialog => { await dialog.accept(); });
  await cleanup.locator('button').last().click();
  await expect(page.getByText(name, { exact: true })).toHaveCount(0);
});
