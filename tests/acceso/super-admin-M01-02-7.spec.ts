import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { PortfoliosPage } from '../pages/PortfoliosPage';

test.describe('M01-02-7 — Super Administrador — Crear portafolio', () => {
  test('crea un portafolio y lo muestra en la lista', async ({ page }) => {
    test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan ATHENEA_USER y ATHENEA_PASSWORD');

    const login = new LoginPage(page);
    const organization = new OrganizationPage(page);
    const dashboard = new DashboardPage(page);
    const portfolios = new PortfoliosPage(page);

    await login.open();
    await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
    if (/SelectOrganizationAtLogin/i.test(page.url())) {
      await organization.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
      await organization.continue();
    }
    await login.expectAuthenticated();
    await dashboard.expectLoaded();

    await portfolios.open();
    const name = `QA-Playwright-M01-02-${Date.now()}`;
    await portfolios.createPortfolio(name);
    await expect(page.locator('body')).toContainText(name);
  });
});
