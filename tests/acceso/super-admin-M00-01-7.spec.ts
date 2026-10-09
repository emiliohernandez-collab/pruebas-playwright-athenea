import { test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test.describe('M00-01-7 — Super Administrador — Consultar lecturas del módulo', () => {
  test('el Dashboard carga con datos de la organización', async ({ page }) => {
    test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan ATHENEA_USER y ATHENEA_PASSWORD');

    const login = new LoginPage(page);
    const organization = new OrganizationPage(page);
    const dashboard = new DashboardPage(page);

    await login.open();
    await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
    if (/SelectOrganizationAtLogin/i.test(page.url())) {
      await organization.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
      await organization.continue();
    }
    await login.expectAuthenticated();
    await dashboard.expectLoaded();
  });
});
