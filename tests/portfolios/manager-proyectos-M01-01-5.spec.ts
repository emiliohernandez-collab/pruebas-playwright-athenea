import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { PortfoliosPage } from '../pages/PortfoliosPage';

test('M01-01-5 — Manager Proyectos — Consultar portafolios', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const organization = new OrganizationPage(page); const dashboard = new DashboardPage(page); const portfolios = new PortfoliosPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await organization.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await organization.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await portfolios.open();
  const portfolioName = await portfolios.openFirstPortfolio();
  await expect(page).not.toHaveURL(/Portfolios\/Index/i);
  await expect(page.locator('body')).toContainText(new RegExp(portfolioName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  await expect(page.locator('body')).toContainText(/proyectos|projects/i);
  await testInfo.attach('manager-proyectos-consulta-portafolio', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
