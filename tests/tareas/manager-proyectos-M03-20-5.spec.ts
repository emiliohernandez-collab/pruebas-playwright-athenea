import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M03-20-5 — Manager Proyectos — Eliminar tarea', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!); if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await page.goto('/Tasks/Create', { waitUntil: 'domcontentloaded' }); const title = `QA M03-20 ${Date.now()}`;
  await page.locator('#title').fill(title); await page.locator('#description').fill('Fixture temporal para probar eliminación M03-20.'); const project = page.locator('#projectId option').filter({ hasText: /QA/i }).first(); await expect(project).toBeAttached(); await page.locator('#projectId').selectOption(await project.getAttribute('value') as string); await page.waitForFunction(() => document.querySelectorAll('#sectionId option').length > 1); await page.locator('#sectionId').selectOption(await page.locator('#sectionId option').nth(1).getAttribute('value') as string); await page.locator('#btnSubmit').click(); await page.waitForURL(/\/Tasks\/Details\//); const taskUrl = page.url(); await expect(page.locator('#taskTitle')).toContainText(title); await page.locator('button:has(i.mdi-dots-vertical)').click(); await page.locator('#btnDelete').click(); await page.getByRole('button', { name: 'Eliminar', exact: true }).click(); await page.waitForURL(/\/Tasks\/(Index|MyTasks)/); await expect(page.locator('body')).not.toContainText(title); await page.goto(taskUrl); await expect(page).toHaveURL(/\/Tasks\/(Index|MyTasks|Details\/)/); await expect(page.locator('#taskTitle')).toHaveCount(0); await testInfo.attach('manager-proyectos-tarea-eliminada', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
