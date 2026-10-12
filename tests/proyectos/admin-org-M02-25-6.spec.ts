import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-25-6 — Administrador Organización — Renombrar sección', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open(); await projects.openFirstProject();
  await page.getByRole('tab', { name: /Lista/i }).click();
  const first = `QA-Athenea-M02-25-A-${Date.now()}`; const second = `QA-Athenea-M02-25-B-${Date.now()}`;
  for (const name of [first, second]) { await page.getByText(/Agregar Sección/i, { exact: true }).click(); const d=page.getByRole('dialog'); await expect(d).toBeVisible(); await d.getByRole('textbox').first().fill(name); await d.getByRole('button', {name:/Crear|Guardar|Agregar/i}).last().click(); await expect(page.locator('body')).toContainText(name); }
  const renamed = `QA-Athenea-M02-25-R-${Date.now()}`;
  const row = page.getByText(first, { exact: true }).locator('xpath=ancestor::*[.//button][1]'); await row.locator('button').first().click();
  const edit = page.getByRole('dialog'); await expect(edit).toBeVisible(); await edit.getByRole('textbox').first().fill(renamed); await edit.getByRole('button', {name:/Guardar|Actualizar/i}).last().click();
  await expect(page.locator('body')).toContainText(renamed, { timeout: 20_000 }); await page.reload({waitUntil:'domcontentloaded'}); await expect(page.locator('body')).toContainText(renamed, {timeout:20_000});
});
