import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test.use({ ignoreHTTPSErrors: true });

test('M16-04-7 — Super Administrador — Aplicar funciones del plan a suscripciones', async ({ page }) => {
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
  await page.goto('/AdminPlans');
  await page.locator('button').filter({ hasText: 'Aplicar a Suscripciones' }).first().click();
  await page.getByRole('button', { name: /Sí, aplicar/i }).click();
  await expect(page.locator('body')).toContainText(/Aplicado|Features aplicados a .* suscripciones activas/i);
});
