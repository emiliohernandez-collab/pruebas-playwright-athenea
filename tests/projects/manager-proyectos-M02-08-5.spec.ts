import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-08-5 — Manager Proyectos — Completar meta del proyecto', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const organization = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  const title = `QA-M02-08-${Date.now()}`; const description = 'Meta temporal para completar';
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await organization.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await organization.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open(); await projects.openFirstProject();
  await projects.createGoal(title, description); await projects.completeGoal(title); await expect(page.locator('body')).toContainText(title);
  await testInfo.attach('manager-proyectos-meta-completada', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  await projects.reopenGoal(title); await projects.deleteGoal(title);
});
