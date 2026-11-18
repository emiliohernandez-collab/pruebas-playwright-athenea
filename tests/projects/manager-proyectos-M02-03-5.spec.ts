import path from 'node:path';
import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-03-5 — Manager Proyectos — Subir archivo al proyecto', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const organization = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  const filePath = path.resolve('tests/fixtures/profile-test.png'); const fileName = path.basename(filePath);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await organization.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await organization.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open(); await projects.openFirstProject(); await projects.openFiles();
  await projects.uploadProjectFile(filePath, fileName); await page.locator('.swal2-popup').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => undefined);
  const fileRow = page.locator('.pf-file-row').filter({ hasText: fileName }).last(); await expect(fileRow).toBeVisible({ timeout: 20_000 }); await expect(fileRow.locator('button, a')).not.toHaveCount(0);
  await testInfo.attach('manager-proyectos-archivo-subido', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  await projects.deleteLatestFile(fileName);
});
