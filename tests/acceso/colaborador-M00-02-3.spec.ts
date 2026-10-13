import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M00-02-3 — Colaborador — Cambiar de organización', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    const expected = page.getByText(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe', { exact: true });
    if (await expected.count()) await expected.click();
    else await page.getByText('Athenea Demo.', { exact: true }).click();
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  const current = page.getByText('Athenea Demo.', { exact: true }).first();
  await current.click();
  await expect(page.locator('body')).toContainText(/Mis Organizaciones/i);
  const options = await page.getByText(/Ribbit|QA Checkout Stripe|Athenea Demo\./).allTextContents();
  expect(options.length).toBeGreaterThanOrEqual(2);
  await page.getByText('Ribbit', { exact: true }).click();
  await expect(page.locator('body')).toContainText(/Organización cambiada|Ribbit/i);
});
