import path from 'node:path';
import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-04-5 — Manager Proyectos — Renombrar o describir archivo', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const organization = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  const filePath = path.resolve('tests/fixtures/profile-test.png'); const fileName = path.basename(filePath); const description = `QA M02-04 validado ${Date.now()}`;
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await organization.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await organization.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open(); await projects.openFirstProject(); await projects.openFiles();
  await projects.uploadProjectFile(filePath, fileName); await projects.editLatestFile(fileName, description); await expect(page.locator('body')).toContainText(description);
  await testInfo.attach('manager-proyectos-descripcion-archivo', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  const editedRow = page.locator('.pf-file-row').filter({ hasText: description }).last();
  await editedRow.locator('button').last().click();
  const modal = page.locator('.swal2-popup').last();
  await expect(modal).toBeVisible({ timeout: 10_000 });
  await modal.getByRole('button', { name: /^(Sí, )?Eliminar$/i }).click();
  await expect(page.locator('.pf-file-row').filter({ hasText: description })).toHaveCount(0, { timeout: 20_000 });
});
