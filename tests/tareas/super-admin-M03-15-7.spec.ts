import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

const taskId = '8b947d76-1b0b-49e4-a946-15dae541bd9e';
const dependencyId = 'f7e2977e-6436-4b1d-befb-615092d82d8e';

test('M03-15-7 — Super Administrador — Crear dependencia entre tareas', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto(`/Tasks/Details/${taskId}`);
  await page.getByRole('tab', { name: /Dependencias/i }).click();
  const existing = page.locator('#dependenciesContent [id^="dep-"]').filter({ hasText: 'QA Fixture M03 Tareas 01' });
  if (await existing.count() === 0) {
    await page.locator('#depTaskSelect').selectOption({ label: 'QA Fixture M03 Tareas 01' });
    await page.locator('#btnAddDependency').click();
  }
  await expect(existing).toBeVisible({ timeout: 20_000 });
  await page.reload();
  await page.getByRole('tab', { name: /Dependencias/i }).click();
  await expect(page.locator('#dependenciesContent [id^="dep-"]').filter({ hasText: 'QA Fixture M03 Tareas 01' })).toBeVisible({ timeout: 20_000 });
  await page.goto(`/Tasks/Details/${dependencyId}`);
  await page.getByRole('tab', { name: /Dependencias/i }).click();
  await expect(page.locator('#dependenciesContent [id^="dep-"]').filter({ hasText: 'QA Fixture M03 Tareas 05' })).toBeVisible({ timeout: 20_000 });
});
