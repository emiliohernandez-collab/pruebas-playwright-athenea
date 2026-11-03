import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M18-05-7 — Super Administrador — Eliminar llave de API', async ({ page }) => {
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
  const name = `QA M18-05-7 ${Date.now()}`;
  await page.locator('#Name').fill(name);
  await page.locator('#Description').fill('Fixture temporal QA M18-05');
  await page.locator('#scopeRoleSelect').selectOption({ label: 'Observador' });
  await page.getByRole('button', { name: /Crear Clave/ }).click();
  await expect(page).toHaveURL(/\/ApiKeys\/Details\//, { timeout: 20_000 });
  await expect(page.locator('body')).toContainText(name);

  const details = page.url();
  const keyId = details.split('/').pop();
  await page.goto(`/ApiKeys/Delete/${keyId}`);
  await expect(page.locator('body')).toContainText(/Confirmar deactivation/i);
  await expect(page.locator('body')).toContainText(name);
  await page.getByRole('button', { name: /Confirmar deactivation/ }).click();
  await expect(page).toHaveURL(/\/ApiKeys$/, { timeout: 20_000 });
  await expect(page.locator('body')).not.toContainText(name);
});
