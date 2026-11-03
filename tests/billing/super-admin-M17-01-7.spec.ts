import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test.use({ ignoreHTTPSErrors: true });

test('M17-01-7 — Super Administrador — Consultar lecturas de facturación', async ({ page }) => {
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

  await page.goto('/Invoices');
  await expect(page.locator('body')).toContainText(/Gestión de facturas/i);
  await expect(page.locator('body')).toContainText(/FACTURAS CFDI/i);

  await page.goto('/BillingProfile');
  await expect(page.locator('body')).toContainText(/Datos de Facturación/i);
  await expect(page.locator('body')).toContainText(/Datos fiscales completos/i);

  await page.goto('/Payments/Dashboard');
  await expect(page.locator('body')).toContainText(/Panel de pagos/i);
  await expect(page.locator('body')).toContainText(/Total de pagos/i);
});
