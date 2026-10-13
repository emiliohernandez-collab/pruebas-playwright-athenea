import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M01-03-3 — Colaborador — No puede editar portafolio', async ({ page }) => {
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
  await page.goto('/Portfolios/Index');
  const detail = page.getByText('Transformación Digital', { exact: true });
  await expect(detail).toBeVisible();
  await detail.click();
  const edit = page.getByText(/Editar portafolio|Edit portfolio|Editar/i).first();
  if (await edit.count()) await expect(edit).toBeDisabled();
  await expect(page.locator('body')).not.toContainText(/Guardar cambios|Save changes/i);
});
