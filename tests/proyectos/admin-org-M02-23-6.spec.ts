import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-23-6 — Administrador Organización — Editar notas del proyecto', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open(); await projects.openFirstProject();
  await page.getByRole('tab', { name: /Notas/i }).click();
  const note = `QA-Athenea-M02-23-${Date.now()}`;
  const editor = page.locator('[contenteditable="true"]:visible').first(); await expect(editor).toBeVisible(); await editor.fill(note);
  await page.getByRole('button', { name: /Guardar ahora/i }).click();
  await expect(page.locator('body')).toContainText(note, { timeout: 20_000 });
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.getByRole('tab', { name: /Notas/i }).click();
  await expect(page.locator('body')).toContainText(note, { timeout: 20_000 });
});
