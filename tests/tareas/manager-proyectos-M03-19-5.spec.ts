import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M03-19-5 — Manager Proyectos — Editar tarea', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!); if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await page.goto('/Tasks/Create', { waitUntil: 'domcontentloaded' }); const marker = Date.now(); const original = `QA M03-19 ${marker}`; const edited = `QA M03-19 editada ${marker}`;
  await page.locator('#title').fill(original); await page.locator('#description').fill('Descripción original M03-19.'); const project = page.locator('#projectId option').filter({ hasText: /QA/i }).first(); await expect(project).toBeAttached(); await page.locator('#projectId').selectOption(await project.getAttribute('value') as string); await page.waitForFunction(() => document.querySelectorAll('#sectionId option').length > 1); await page.locator('#sectionId').selectOption(await page.locator('#sectionId option').nth(1).getAttribute('value') as string); await page.locator('#btnSubmit').click(); await page.waitForURL(/Tasks\/Details\//i); await page.locator('#btnEditTaskSidebar').click(); const dialog = page.locator('[role="dialog"]:visible'); await dialog.getByRole('textbox').nth(0).fill(edited); await dialog.getByRole('textbox').nth(1).fill('Descripción editada M03-19.'); await page.locator('button:visible').filter({ hasText: 'Guardar cambios' }).click(); await expect(page.locator('#taskTitle')).toContainText(edited); await page.reload({ waitUntil: 'networkidle' }); await expect(page.locator('#taskTitle')).toContainText(edited); await testInfo.attach('manager-proyectos-tarea-editada', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
