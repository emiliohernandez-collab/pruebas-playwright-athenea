import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-19-7 — Super Administrador — Quitar miembro del proyecto', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open(); await projects.openFirstProject();
  const member = page.locator('a[href*="0b15c68d-6aa8-4a1e-969c-f0f074e1438f"]');
  const row = member.locator('xpath=ancestor::div[.//button[@title="Eliminar miembro"]][1]');
  await row.locator('button[title="Eliminar miembro"]').click();
  await page.getByRole('button', { name: /Eliminar/ }).last().click();
  await expect(page.locator('a[href*="0b15c68d-6aa8-4a1e-969c-f0f074e1438f"]')).toHaveCount(0);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('a[href*="0b15c68d-6aa8-4a1e-969c-f0f074e1438f"]')).toHaveCount(0);
});
