import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-14-7 — Super Administrador — Reabrir hito', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  const projects = new ProjectsPage(page);

  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await projects.open();
  await projects.openFirstProject();
  await page.getByText('Hitos', { exact: true }).click();

  const title = `QA M02-14 Reabrir hito ${Date.now()}`;
  await page.getByText('Nuevo hito', { exact: true }).click();
  await page.locator('#msTitle').fill(title);
  await page.locator('#msDescription').fill('Fixture reversible para M02-14-7.');
  await page.locator('#msDueDate').fill('2026-11-01');
  await page.getByText('Crear hito', { exact: true }).click();

  const row = page.getByText(title, { exact: true }).locator('xpath=ancestor::div[contains(@class,"border")][1]');
  const checkbox = row.locator('input[type="checkbox"]');
  await checkbox.check();
  await expect(checkbox).toBeChecked();
  await checkbox.uncheck();
  await expect(checkbox).not.toBeChecked();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByText('Hitos', { exact: true }).click();
  await expect(page.getByText(title, { exact: true }).locator('xpath=ancestor::div[contains(@class,"border")][1]').locator('input[type="checkbox"]')).not.toBeChecked();
});
