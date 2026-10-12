import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M03-02-6 — Administrador Organización — Asignar responsable a una tarea', async ({ page }) => {
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

  // Fixture persistente creada en QA: QA Fixture M03 Tareas 02.
  await page.goto('/Tasks/Details/03cbdef4-1f43-4e98-bff5-c63408ac8052');
  await expect(page).toHaveURL(/Tasks\/Details\//i);
  const assignee = page.locator('#extraAssigneeSelect');
  await assignee.selectOption({ label: 'Demo Administrador Org' });
  await page.locator('#btnAddExtraAssignee').click();
  await expect(page.locator('#taskExtraAssignees')).toContainText('Demo Administrador Org');
});
