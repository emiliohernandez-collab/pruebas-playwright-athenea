import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M13-20-6 — Administrador Organización — Vista previa de plantilla', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    const expected = page.getByText(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe', { exact: true });
    if (await expected.count()) await expected.click();
    else await page.getByText('Athenea Demo.', { exact: true }).click();
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();

  const name = `QA Playwright preview ${Date.now()}`;
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
  await expect(page.locator('body')).toContainText(/creada|éxito|correctamente|Plantilla/i);

  await page.goto('/NotificationTemplates');
  const title = page.getByText(name, { exact: true });
  await expect(title).toBeVisible();
  const card = title.locator('xpath=ancestor::div[contains(@class, "card")][1]');
  await card.getByText('Editar', { exact: true }).click();
  await expect(page).toHaveURL(/NotificationTemplates\/Edit/i);
  await page.getByRole('button', { name: /Vista previa|Preview/i }).click();
  await expect(page.locator('body')).toContainText(/vista previa|Hola|datos de ejemplo|Vista previa QA/i);

  // Limpiar el fixture sin alterar plantillas existentes.
  await page.goto('/NotificationTemplates');
  const cleanup = page.getByText(name, { exact: true }).locator('xpath=ancestor::div[contains(@class, "card")][1]');
  page.once('dialog', async dialog => { await dialog.accept(); });
  await cleanup.locator('button').last().click();
  await expect(page.getByText(name, { exact: true })).toHaveCount(0);
});
