import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { PortfoliosPage } from '../pages/PortfoliosPage';

test('M01-03-5 — Manager Proyectos — Editar portafolio', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page);
  const organization = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  const portfolios = new PortfoliosPage(page);
  const original = `QA-Playwright-M01-03-${Date.now()}`;
  const edited = `${original}-editado`;

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
    await portfolios.createPortfolio(original);
    const card = page.locator('.portfolio-card').filter({ has: page.getByRole('heading', { name: original, exact: true }) });
    await card.getByRole('button', { name: /Editar/i }).click();
    await expect(page.getByRole('heading', { name: /Editar Portafolio/i })).toBeVisible();
    await page.getByPlaceholder('Nombre del portafolio').fill(edited);
    const description = page.getByPlaceholder(/descripci[oó]n/i).first();
    if (await description.count()) await description.fill('Descripción QA editada');
    await page.getByRole('button', { name: /Actualizar|Guardar/i }).click();
    await expect(page).toHaveURL(/Portfolios\/Details\//i);
    await expect(page.getByRole('heading', { name: edited, exact: true })).toBeVisible();
    await portfolios.open();
    await expect(page.getByRole('heading', { name: edited, exact: true })).toBeVisible();
    await testInfo.attach('manager-proyectos-editar-portafolio', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  } finally {
    await portfolios.open();
    const editedCard = page.locator('.portfolio-card').filter({ has: page.getByRole('heading', { name: edited, exact: true }) });
    if (await editedCard.count()) await portfolios.deletePortfolio(edited);
    else {
      const originalCard = page.locator('.portfolio-card').filter({ has: page.getByRole('heading', { name: original, exact: true }) });
      if (await originalCard.count()) await portfolios.deletePortfolio(original);
    }
  }
});
