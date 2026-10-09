import path from 'node:path';
import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test.describe('M02-05-7 — Super Administrador — Eliminar archivo del proyecto', () => {
  test('sube un archivo, lo elimina y lo retira de la lista', async ({ page }) => {
    test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan ATHENEA_USER y ATHENEA_PASSWORD');
    const login = new LoginPage(page); const organization = new OrganizationPage(page);
    const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
    const filePath = path.resolve('tests/fixtures/profile-test.png');
    const fileName = path.basename(filePath);

    await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
    if (/SelectOrganizationAtLogin/i.test(page.url())) { await organization.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await organization.continue(); }
    await login.expectAuthenticated(); await dashboard.expectLoaded();
    await projects.open(); await projects.openFirstProject(); await projects.openFiles();
    await projects.uploadProjectFile(filePath, fileName); await projects.deleteLatestFile(fileName);
    await expect(page.locator('body')).toContainText(/Proyecto Archivos/i);
  });
});
