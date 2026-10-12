import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

const taskId = '8b947d76-1b0b-49e4-a946-15dae541bd9e';

test('M03-21-6 — Administrador Organización — Cambiar estado de tarea', async ({ page }) => {
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

  await page.locator('#btnEditTaskSidebar').click();
  let dialog = page.locator('[role="dialog"]:visible');
  await dialog.getByRole('combobox').nth(0).selectOption({ label: 'En progreso' });
  await page.locator('button:visible').filter({ hasText: 'Guardar cambios' }).click();
  await expect(page.locator('#taskTitle').locator('..')).toContainText('En progreso');
  await page.reload();
  await expect(page.locator('#taskTitle').locator('..')).toContainText('En progreso');

  await page.locator('#btnEditTaskSidebar').click();
  dialog = page.locator('[role="dialog"]:visible');
  await dialog.getByRole('combobox').nth(0).selectOption({ label: 'Por hacer' });
  await page.locator('button:visible').filter({ hasText: 'Guardar cambios' }).click();
  await page.reload();
  await expect(page.locator('#taskTitle').locator('..')).toContainText('Por hacer');
});
