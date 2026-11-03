import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test.use({ ignoreHTTPSErrors: true });

test('M17-03-7 — Super Administrador — Editar cliente del panel de administración', async ({ page }) => {
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);

  await page.goto('/Subscriptions/Dashboard');
  if (/Account\/Login/i.test(page.url())) {
    await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
    if (/SelectOrganizationAtLogin/i.test(page.url())) {
      await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
      await org.continue();
    }
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();

  const originalName = 'QA M16-10';
  const testName = 'QA M16-10 Cliente Editado';
  await page.goto('/Customers');
  await page.locator('input[name="search"]').fill(originalName);
  await page.getByRole('button', { name: /Buscar/i }).click();
  await page.locator('a[href*="/Customers/Edit/"]').first().click();

  await page.locator('input[name="BillingName"]').fill(testName);
  await page.getByRole('button', { name: /Guardar/i }).click();
  await expect(page.locator('body')).toContainText(/Cliente actualizado exitosamente/i);
  await expect(page.locator('body')).toContainText(testName);

  await page.getByRole('link', { name: /Editar/i }).click();
  await page.locator('input[name="BillingName"]').fill(originalName);
  await page.getByRole('button', { name: /Guardar/i }).click();
  await expect(page.locator('body')).toContainText(/Cliente actualizado exitosamente/i);
  await expect(page.locator('body')).toContainText(originalName);
});
