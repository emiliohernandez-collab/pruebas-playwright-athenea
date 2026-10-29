import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

const taskId = '8b947d76-1b0b-49e4-a946-15dae541bd9e';

test('M03-21-7 — Super Administrador — Cambiar estado de tarea', async ({ page }) => {
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
  await dialog.locator('#editStatus').selectOption({ label: 'En progreso' });
  await page.locator('#btnSaveTask').click();
  await expect(page.locator('#taskTitle').locator('..')).toContainText('En progreso');
  await page.reload();
  await expect(page.locator('#taskTitle').locator('..')).toContainText('En progreso', { timeout: 20_000 });
  await page.locator('#btnEditTaskSidebar').click();
  dialog = page.locator('[role="dialog"]:visible');
  await dialog.locator('#editStatus').selectOption({ label: 'Por hacer' });
  await page.locator('#btnSaveTask').click();
  await page.waitForTimeout(2_000);
  await page.reload();
  await expect(page.locator('#taskTitle').locator('..')).toContainText('Por hacer', { timeout: 20_000 });
});
