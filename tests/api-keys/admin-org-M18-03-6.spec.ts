import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M18-03-6 — Administrador Organización — Crear llave API', async ({ page }) => {
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
  await expect(page.locator('body')).toContainText(/Crear|Nueva.*llave|API/i);
  const name = `QA M18-03 ${Date.now()}`;
  await page.getByRole('textbox').first().fill(name);
  const scope = page.locator('select').first();
  await expect(scope).toBeVisible();
  await scope.selectOption({ index: 1 });
  const save = page.getByRole('button', { name: /Guardar|Crear|Generar/i }).last();
  await expect(save).toBeVisible();
  await save.click();
  await expect(page).toHaveURL(/ApiKeys/i, { timeout: 20_000 });
  await expect(page.locator('body')).toContainText(name, { timeout: 20_000 });
});
