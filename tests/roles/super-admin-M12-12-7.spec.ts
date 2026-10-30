import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M12-12-7 — Super Administrador — Editar rol', async ({ page }) => {
  test.setTimeout(60_000);
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select('QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  const original = `QA M12-12 ${Date.now()}`;
  const edited = `${original} Editado`;
  await page.goto('/Roles/Create');
  await page.locator('#Name').fill(original);
  await page.locator('#Description').fill('Fixture temporal M12-12.');
  await page.getByRole('button', { name: /Crear rol/i }).click();
  await expect(page).toHaveURL(/\/Roles$/, { timeout: 15_000 });
  await page.waitForTimeout(1_500);
  await page.locator('#searchInput').fill(original);
  await page.locator('#searchInput').press('Tab');
  await page.waitForTimeout(500);
  const row = page.getByRole('row').filter({ hasText: original }).first();
  await expect(row).toBeVisible();
  await row.locator('a[aria-label="Editar"]').click();
  await page.locator('#Name').fill(edited);
  await page.locator('#Description').fill('Fixture temporal M12-12 editado.');
  await page.getByRole('button', { name: /Actualizar Rol/i }).click();
  await expect(page).toHaveURL(/\/Roles$/, { timeout: 15_000 });
  await page.waitForTimeout(1_500);
  await page.locator('#searchInput').fill(edited);
  await page.locator('#searchInput').press('Tab');
  await page.waitForTimeout(500);
  const updated = page.getByRole('row').filter({ hasText: edited }).first();
  await expect(updated).toBeVisible();
  await updated.locator('a[aria-label="Eliminar"]').click();
  await expect(page).toHaveURL(/\/Roles\/Delete\//);
  await page.getByRole('button', { name: /Eliminar rol/i }).click();
});
