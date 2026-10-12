import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-15-6 — Administrador Organización — Eliminar hito', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open(); await projects.openFirstProject();
  await page.getByRole('tab', { name: /Hitos/i }).click();
  const title = `QA-M02-15-${Date.now()}`; await projects.createMilestone(title);
  const row = page.getByText(title, { exact: true }).locator('xpath=ancestor::*[.//button][1]');
  await row.locator('button').last().click();
  const confirm = page.getByRole('button', { name: /Sí, eliminar/i }); await expect(confirm).toBeVisible(); await confirm.click();
  await expect(page.getByText(title, { exact: true })).toHaveCount(0, { timeout: 20_000 });
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.getByRole('tab', { name: /Hitos/i }).click();
  await expect(page.getByText(title, { exact: true })).toHaveCount(0, { timeout: 20_000 });
});
