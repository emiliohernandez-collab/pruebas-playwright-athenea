import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M03-20-7 — Super Administrador — Eliminar tarea', async ({ page }) => {
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
  await page.goto('/Tasks/Create');
  const title = `QA Fixture M03-20 ${Date.now()}`;
  await page.locator('#title').fill(title);
  await page.locator('#description').fill('Fixture para probar eliminación M03-20.');
  await page.locator('#projectId').selectOption({ label: 'QA-Athenea-M02-22-1791828641800' });
  await page.waitForFunction(() => document.querySelectorAll('#sectionId option').length > 1);
  await page.locator('#sectionId').selectOption({ label: 'Por hacer' });
  await page.locator('#btnSubmit').click();
  await page.waitForURL(/\/Tasks\/Details\//);
  const taskUrl = page.url();
  await expect(page.locator('#taskTitle')).toContainText(title);
  await page.locator('button:has(i.mdi-dots-vertical)').click();
  await page.locator('#btnDelete').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Eliminar', exact: true }).click();
  await page.waitForURL(/\/Tasks\/(Index|MyTasks)/);
  await expect(page.locator('body')).not.toContainText(title);
  await page.goto(taskUrl);
  await expect(page).toHaveURL(/\/Tasks\/(Index|MyTasks|Details\/)/);
  await expect(page.locator('#taskTitle')).toHaveCount(0);
});
