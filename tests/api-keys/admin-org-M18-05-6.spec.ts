import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M18-05-6 — Administrador Organización — Eliminar llave API de prueba', async ({ page }) => {
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
  await page.goto('/ApiKeys');
  const row = page.locator('tr').filter({ hasText: /QA M18-04 edit/ }).first();
  await expect(row).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await row.getByRole('link', { name: /Desactivar|Eliminar/i }).click();
  await expect(page).toHaveURL(/ApiKeys/i, { timeout: 20_000 });
  await expect(page.locator('tr').filter({ hasText: /QA M18-04 edit/ })).toHaveCount(0, { timeout: 20_000 });
});
