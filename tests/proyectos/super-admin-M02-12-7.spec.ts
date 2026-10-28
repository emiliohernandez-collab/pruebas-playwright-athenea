import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-12-7 — Super Administrador — Editar hito', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  const projects = new ProjectsPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await org.select(process.env.ATHENEA_ORGANIZATION ?? 'Ribbit');
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await projects.open();
  await projects.openFirstProject();
  await page.getByRole('tab', { name: /Hitos/i }).click();
  const title = `QA-M02-12-${Date.now()}`;
  const description = 'Descripción editada por Playwright QA';
  await projects.createMilestone(title);
  const titleText = page.getByText(title, { exact: true });
  const container = titleText.locator('xpath=ancestor::*[.//button][1]');
  await container.locator('button').first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('textbox').nth(1).fill(description);
  await dialog.getByRole('button', { name: /Guardar|Actualizar/i }).click();
  await expect(page.locator('body')).toContainText(description, { timeout: 20_000 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('tab', { name: /Hitos/i }).click();
  await expect(page.locator('body')).toContainText(description, { timeout: 20_000 });
});
