import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-15-5 — Manager Proyectos — Eliminar hito', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open(); await projects.openFirstProject(); await page.getByText('Hitos', { exact: true }).click();
  const title = `QA M02-15 Eliminar hito ${Date.now()}`; await page.getByRole('button', { name: /Nuevo hito/i }).click(); await page.locator('#msTitle').fill(title); await page.locator('#msDescription').fill('Fixture temporal para M02-15-5.'); await page.locator('#msDueDate').fill('2026-12-31'); await page.getByRole('button', { name: /Crear hito/i }).click();
  const row = page.getByText(title, { exact: true }).locator('xpath=ancestor::div[contains(@class,"border")][1]'); await expect(row).toBeVisible(); await testInfo.attach('manager-proyectos-hito-antes-de-eliminar', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  await row.locator('button').last().click(); await page.getByRole('button', { name: /Sí, eliminar/i }).click(); await expect(page.getByText(title, { exact: true })).toHaveCount(0); await page.reload({ waitUntil: 'domcontentloaded' }); await page.getByText('Hitos', { exact: true }).click(); await expect(page.getByText(title, { exact: true })).toHaveCount(0);
  await testInfo.attach('manager-proyectos-hito-eliminado', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
