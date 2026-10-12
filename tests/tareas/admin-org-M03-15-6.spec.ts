import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

const taskId = '8b947d76-1b0b-49e4-a946-15dae541bd9e';
const dependencyId = '03cbdef4-1f43-4e98-bff5-c63408ac8052';

test('M03-15-6 — Administrador Organización — Crear dependencia entre tareas', async ({ page }) => {
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
  await page.locator('#depTaskSelect').selectOption(dependencyId);
  await page.locator('#btnAddDependency').click();
  await expect(page.locator('#dependenciesContent, [id="dependenciesContent"]')).toContainText(/QA Fixture M03 Tareas 02/i);

  await page.reload();
  await page.getByRole('tab', { name: /Dependencias/i }).click();
  await expect(page.locator('#dependenciesContent, [id="dependenciesContent"]')).toContainText(/QA Fixture M03 Tareas 02/i);

  await page.goto(`/Tasks/Details/${dependencyId}`);
  await page.getByRole('tab', { name: /Dependencias/i }).click();
  await expect(page.locator('#dependenciesContent, [id="dependenciesContent"]')).toContainText(/QA Fixture M03 Tareas 05/i);
});
