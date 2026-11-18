import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { PortfoliosPage } from '../pages/PortfoliosPage';

test('M01-02-5 — Manager Proyectos — Crear portafolio', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page);
  const organization = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  const portfolios = new PortfoliosPage(page);
  const name = `QA-Playwright-M01-02-${Date.now()}`;

  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    const expected = page.getByText(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe', { exact: true });
    if (await expected.count()) await expected.click();
    else await page.getByText('Athenea Demo.', { exact: true }).click();
    await organization.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await portfolios.open();
  try {
    await portfolios.createPortfolio(name);
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    await testInfo.attach('manager-proyectos-crear-portafolio', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  } finally {
    await portfolios.open();
    if (await page.getByRole('heading', { name, exact: true }).count()) await portfolios.deletePortfolio(name);
  }
});
