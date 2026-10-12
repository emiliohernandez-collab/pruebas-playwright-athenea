import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

const taskId = '8b947d76-1b0b-49e4-a946-15dae541bd9e';

test('M04-03-6 — Administrador Organización — Editar registro de tiempo', async ({ page }) => {
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
  const description = `Registro QA M04-03 ${Date.now()}`;
  await page.locator('#teHours').fill('0.5');
  await page.locator('#teDescription').fill(description);
  await page.locator('#btnAddTimeEntry').click();
  const entry = page.locator('#timeEntriesList > *').filter({ hasText: description }).first();
  await expect(entry).toBeVisible();
  await entry.locator('button:has(i.mdi-dots-vertical)').click();
  await page.locator('a[onclick^="editTimeEntry"]:visible').click();
  const updated = `Registro QA M04-03 editado ${Date.now()}`;
  const editDialog = page.getByRole('dialog');
  await editDialog.getByRole('spinbutton').fill('1');
  await editDialog.getByRole('textbox').fill(updated);
  await editDialog.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.locator('#timeEntriesList')).toContainText(updated);
  await page.reload();
  await page.getByRole('tab', { name: /Tiempo/i }).click();
  await expect(page.locator('#timeEntriesList')).toContainText(updated);
});
