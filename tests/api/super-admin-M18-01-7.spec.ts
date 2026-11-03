import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test.use({ ignoreHTTPSErrors: true });

test('M18-01-7 — Super Administrador — Consultar lecturas de API REST', async ({ page }) => {
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

  await page.goto('/ApiKeys');
  await expect(page.locator('body')).toContainText(/Claves API/i);
  await expect(page.locator('body')).toContainText(/Nombre|Prefijo de Clave|Alcance/i);

  await page.goto('/ApiKeys/Dashboard');
  await expect(page.locator('body')).toContainText(/Panel de Claves API/i);
  await expect(page.locator('body')).toContainText(/TOTAL DE CLAVES|Distribución de permisos/i);
});
