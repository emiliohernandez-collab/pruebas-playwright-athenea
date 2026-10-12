import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-18-6 — Administrador Organización — Agregar miembro al proyecto', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open(); await projects.openFirstProject();
  const add = page.getByRole('button', { name: /Buscar y Agregar Miembros/i }); await expect(add).toBeVisible(); await add.click();
  const dialog = page.getByRole('dialog'); await expect(dialog).toBeVisible();
  const candidate = dialog.locator('button').nth(1); await expect(candidate).toBeVisible(); await candidate.click();
  await expect(page.locator('body')).toContainText(/miembro agregado|miembros|Administrador/i, { timeout: 20_000 });
});
