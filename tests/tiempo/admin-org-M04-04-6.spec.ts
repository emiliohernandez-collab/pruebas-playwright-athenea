import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

const taskId = '8b947d76-1b0b-49e4-a946-15dae541bd9e';

test('M04-04-6 — Administrador Organización — Eliminar registro de tiempo', async ({ page }) => {
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
  await page.getByRole('tab', { name: /Tiempo/i }).click();
  const description = `Registro QA M04-04 ${Date.now()}`;
  await page.locator('#teHours').fill('0.25');
  await page.locator('#teDescription').fill(description);
  await page.locator('#btnAddTimeEntry').click();
  const entry = page.locator('#timeEntriesList > *').filter({ hasText: description }).first();
  await expect(entry).toBeVisible();
  await entry.locator('button:has(i.mdi-dots-vertical)').click();
  await page.locator('a[onclick^="deleteTimeEntry"]:visible').click();
  await page.getByRole('button', { name: /Eliminar|Sí|Confirmar/i }).click();
  await expect(page.locator('#timeEntriesList')).not.toContainText(description);
  await page.reload();
  await page.getByRole('tab', { name: /Tiempo/i }).click();
  await expect(page.locator('#timeEntriesList')).not.toContainText(description);
});
