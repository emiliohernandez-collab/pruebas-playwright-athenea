import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M03-04-7 — Super Administrador — Quitar responsable de una tarea', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await page.goto('/Tasks/Create');
  const title = `QA M03-04 Fixture ${Date.now()}`;
  await page.locator('#title').fill(title); await page.locator('#description').fill('Fixture para probar quitar responsable M03-04-7.');
  const project = page.locator('#projectId option').filter({ hasText: /QA M02-17 Editado/i }).first(); await page.locator('#projectId').selectOption(await project.getAttribute('value') as string);
  await page.locator('#sectionId').selectOption((await page.locator('#sectionId option').nth(1).getAttribute('value')) as string);
  await page.locator('#priority').selectOption({ label: 'Alta' }); await page.locator('#assigneeId').selectOption(''); await page.locator('#btnSubmit').click();
  await expect(page).toHaveURL(/Tasks\/Details\//i); const extra = page.locator('#extraAssigneeSelect');
  await extra.selectOption({ label: 'QA Admin Super Sistema' }); await page.locator('#btnAddExtraAssignee').click(); await expect(page.locator('#taskExtraAssignees')).toContainText('QA Admin Super Sistema');
  await page.locator('#taskExtraAssignees button').first().click(); await page.getByRole('button', { name: 'Eliminar', exact: true }).last().click(); await expect(page.locator('#taskExtraAssignees')).not.toContainText('QA Admin Super Sistema');
});
