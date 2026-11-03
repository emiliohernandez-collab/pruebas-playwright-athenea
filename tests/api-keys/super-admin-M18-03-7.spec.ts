import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M18-03-7 — Super Administrador — Crear y revocar llave de API', async ({ page }) => {
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);

  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();

  await page.goto('/ApiKeys/Create');
  await expect(page.locator('#Name')).toBeVisible();
  const name = `QA M18-03-7 ${Date.now()}`;
  await page.locator('#Name').fill(name);
  await page.locator('#Description').fill('Llave desechable para validar M18-03-7');
  await page.locator('#scopeRoleSelect').selectOption({ label: 'Observador' });
  await page.locator('#RateLimitPerHour').fill('100');
  await page.getByRole('button', { name: /Crear Clave/ }).click();

  await expect(page).toHaveURL(/\/ApiKeys\/Details\//, { timeout: 20_000 });
  await expect(page.locator('body')).toContainText('Creada exitosamente');
  await expect(page.locator('body')).toContainText(name);
  await expect(page.locator('body')).toContainText('Estado');
  await expect(page.locator('body')).toContainText('Activa');

  await page.getByRole('button', { name: /Revocar permanentemente/ }).click();
  await page.locator('#revokeModal').getByRole('button', { name: /Revocar permanentemente/ }).click();
  await expect(page.locator('body')).toContainText(/revoked.*exitosamente|revocad[oa]/i, { timeout: 20_000 });
  await expect(page.locator('body')).toContainText('Revocada');
  await expect(page.locator('body')).toContainText('No Válido');
});
