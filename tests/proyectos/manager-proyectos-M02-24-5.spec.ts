import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-24-5 — Manager Proyectos — Crear sección del proyecto', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!); if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open(); await projects.openFirstProject(); await page.getByRole('tab', { name: /Lista|Tablero/i }).first().click();
  const name = `QA M02-24 Sección ${Date.now()}`; await page.getByText(/Agregar Sección/i, { exact: true }).click(); const dialog = page.getByRole('dialog'); await expect(dialog).toBeVisible(); await dialog.getByRole('textbox').first().fill(name); await dialog.getByRole('button', { name: /Crear|Guardar|Agregar/i }).last().click(); await expect(page.locator('body')).toContainText(name, { timeout: 20_000 }); await page.reload({ waitUntil: 'domcontentloaded' }); await expect(page.locator('body')).toContainText(name, { timeout: 20_000 }); await testInfo.attach('manager-proyectos-seccion-creada', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
