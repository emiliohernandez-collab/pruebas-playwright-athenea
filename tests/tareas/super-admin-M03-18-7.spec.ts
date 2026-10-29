import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M03-18-7 — Super Administrador — Crear tarea', async ({ page }) => {
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
  const title = `QA Fixture M03-18 ${Date.now()}`;
  await page.locator('#title').fill(title);
  await page.locator('#description').fill('Tarea creada por prueba automatizada M03-18.');
  await page.locator('#projectId').selectOption({ label: 'QA-Athenea-M02-22-1791828641800' });
  await page.waitForFunction(() => document.querySelectorAll('#sectionId option').length > 1);
  await page.locator('#sectionId').selectOption({ label: 'Por hacer' });
  await page.locator('#priority').selectOption('High');
  await page.locator('#assigneeId').selectOption({ label: 'Demo Administrador Org' });
  await page.locator('#btnSubmit').click();
  await expect(page).toHaveURL(/\/Tasks\/Details\//);
  await expect(page.locator('#taskTitle')).toContainText(title);
  await page.reload();
  await expect(page.locator('#taskTitle')).toContainText(title);
});
