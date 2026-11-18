import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-01-5 — Manager Proyectos — Consultar proyectos', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const organization = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await organization.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await organization.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open();
  const projectName = await projects.openFirstProject(); await projects.expectDetailTabs();
  await expect(page.locator('body')).toContainText(projectName); await expect(page.locator('body')).toContainText(/Equipo Miembros|Descripción del Proyecto/i);
  await testInfo.attach('manager-proyectos-consulta-proyecto', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
