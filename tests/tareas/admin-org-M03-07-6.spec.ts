import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M03-07-6 — Administrador Organización — Eliminar adjunto de tarea', async ({ page }) => {
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
  await page.goto('/Tasks/Details/8b947d76-1b0b-49e4-a946-15dae541bd9e');
  await page.getByRole('tab', { name: /Archivos/i }).click();
  const files = page.locator('.file-item').filter({ hasText: 'qa-attachment.txt' });
  await expect(files).toHaveCount(2);
  await files.first().locator('button[title="Eliminar"]').click();
  await page.getByRole('button', { name: 'Eliminar', exact: true }).click();
  await expect(page.locator('.file-item').filter({ hasText: 'qa-attachment.txt' })).toHaveCount(1, { timeout: 20_000 });
  await page.reload();
  await page.getByRole('tab', { name: /Archivos/i }).click();
  await expect(page.locator('.file-item').filter({ hasText: 'qa-attachment.txt' })).toHaveCount(1, { timeout: 20_000 });
});
