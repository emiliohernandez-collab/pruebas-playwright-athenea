import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M00-07-3 — Colaborador — Cambiar idioma y restaurar Español', async ({ page }) => {
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
  await page.getByRole('button', { name: /ES/ }).first().click();
  await page.getByText('English', { exact: true }).click();
  await expect(page.locator('body')).toContainText(/Welcome|My Tasks|Tasks/i);
  await page.getByRole('button', { name: /EN/ }).first().click();
  await page.getByText('Español', { exact: true }).click();
  await expect(page.locator('body')).toContainText(/Bienvenido|Mis tareas|Tareas/i);
});
