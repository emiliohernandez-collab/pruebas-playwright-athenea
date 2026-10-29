import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-20-7 — Super Administrador — Cambiar rol de miembro', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open(); await projects.openFirstProject();
  const member = page.locator('a[href*="12994d69-82bc-4ec6-a2cd-e253814252bd"]');
  const row = member.locator('xpath=ancestor::div[.//select][1]');
  const role = row.locator('select');
  await role.selectOption({ label: 'Editor' });
  await expect(role.locator('option:checked')).toHaveText('Editor');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('a[href*="12994d69-82bc-4ec6-a2cd-e253814252bd"]').locator('xpath=ancestor::div[.//select][1]').locator('select option:checked')).toHaveText('Editor');
});
