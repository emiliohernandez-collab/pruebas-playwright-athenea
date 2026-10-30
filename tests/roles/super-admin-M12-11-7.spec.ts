import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M12-11-7 — Super Administrador — Crear rol', async ({ page }) => {
  test.setTimeout(60_000);
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select('QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  const name = `QA Playwright M12-11-7 ${Date.now()}`;
  await page.goto('/Roles/Create');
  await page.locator('#Name').fill(name);
  await page.locator('#Description').fill('Temporary role fixture for M12-11-7.');
  await page.getByRole('button', { name: /Crear rol/i }).click();
  await page.goto('/Roles');
  const row = page.getByRole('row').filter({ hasText: name }).first();
  await expect(row).toBeVisible();
  await row.locator('a[href*="/Roles/Delete/"]').click();
  await page.getByRole('button', { name: /Sí, eliminar|Confirmar|Eliminar/i }).last().click().catch(() => {});
});
