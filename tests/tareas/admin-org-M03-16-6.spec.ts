import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

const taskId = '8b947d76-1b0b-49e4-a946-15dae541bd9e';

test('M03-16-6 — Administrador Organización — Editar dependencia', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto(`/Tasks/Details/${taskId}`);
  await page.getByRole('tab', { name: /Dependencias/i }).click();

  const dependency = page.locator('#dependenciesContent [id^="dep-"]').first();
  await expect(dependency).toBeVisible();
  await dependency.locator('button[title="Editar"]').click();
  await page.locator('#swal2-select').selectOption('start_to_start');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await page.waitForTimeout(500);

  await page.reload();
  await page.getByRole('tab', { name: /Dependencias/i }).click();
  await page.locator('#dependenciesContent [id^="dep-"]').first().locator('button[title="Editar"]').click();
  await expect(page.locator('#swal2-select')).toHaveValue('start_to_start');
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
});
