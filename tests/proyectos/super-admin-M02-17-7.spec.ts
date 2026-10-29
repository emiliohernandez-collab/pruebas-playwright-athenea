import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-17-7 — Super Administrador — Editar proyecto', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open(); await projects.openFirstProject();
  const newName = `QA M02-17 Editado ${Date.now()}`;
  await page.locator('button.btn.btn-outline-secondary.btn-sm').first().click();
  await page.locator('#projectName').fill(newName);
  await page.getByRole('button', { name: /Guardar Cambios/i }).click();
  await expect(page.locator('#projectName')).toHaveValue(newName, { timeout: 20_000 });
});
