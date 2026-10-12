import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

const taskId = '8b947d76-1b0b-49e4-a946-15dae541bd9e';

test('M04-02-6 — Administrador Organización — Registrar tiempo', async ({ page }) => {
  test.skip(!process.env.ATHENA_USER && !process.env.ATHENEA_USER, 'Faltan credenciales');
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
  await page.getByRole('tab', { name: /Tiempo/i }).click();
  const description = `Registro QA M04-02 ${Date.now()}`;
  await page.locator('#teHours').fill('0.5');
  await page.locator('#teDescription').fill(description);
  await page.locator('#btnAddTimeEntry').click();
  await expect(page.locator('#timeEntriesContent')).toContainText(description);
  await expect(page.locator('#timeEntriesContent')).toContainText(/0\.5h|12-oct/i);
  await page.reload();
  await page.getByRole('tab', { name: /Tiempo/i }).click();
  await expect(page.locator('#timeEntriesContent')).toContainText(description);
});
