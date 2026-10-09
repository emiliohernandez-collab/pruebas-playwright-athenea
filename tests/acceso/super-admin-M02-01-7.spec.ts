import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test.describe('M02-01-7 — Super Administrador — Consultar lecturas de Proyectos', () => {
  test('muestra proyectos y permite abrir el detalle con sus pestañas', async ({ page }) => {
    test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan ATHENEA_USER y ATHENEA_PASSWORD');

    const login = new LoginPage(page);
    const organization = new OrganizationPage(page);
    const dashboard = new DashboardPage(page);
    const projects = new ProjectsPage(page);

    await login.open();
    await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
    if (/SelectOrganizationAtLogin/i.test(page.url())) {
      await organization.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
      await organization.continue();
    }
    await login.expectAuthenticated();
    await dashboard.expectLoaded();

    await projects.open();
    const projectName = await projects.openFirstProject();
    await projects.expectDetailTabs();
    await expect(page.locator('body')).toContainText(projectName);
    await expect(page.locator('body')).toContainText(/Equipo Miembros|Descripción del Proyecto/i);
  });
});
