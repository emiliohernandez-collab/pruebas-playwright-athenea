import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M11-13-7/M11-14-7 — fixture sintético — asignar y retirar usuario', async ({ page }) => {
  test.setTimeout(60_000);
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select('QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/Roles/ManageUsers/6a301efc-4b96-4c58-b6f2-969fd223fed6');
  const existing = page.getByRole('row').filter({ hasText: 'emilyhdzp@gmail.com' });
  if (await existing.count() === 0) {
    await page.locator('#select2-userSelect-container').click();
    await page.locator('.select2-search__field').fill('emilyhdzp@gmail.com');
    await page.getByRole('option', { name: /emilyhdzp@gmail\.com/i }).click();
    await page.getByRole('button', { name: /Asignar rol/i }).click();
    await page.getByRole('button', { name: /Sí, asignar rol/i }).click();
    await expect(page.getByRole('row').filter({ hasText: 'emilyhdzp@gmail.com' })).toBeVisible();
  }
  const row = page.getByRole('row').filter({ hasText: 'emilyhdzp@gmail.com' }).first();
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: /Eliminar/i }).click();
  await page.getByRole('button', { name: /Sí, Eliminar de Rol/i }).click();
  await expect(page.getByRole('row').filter({ hasText: 'emilyhdzp@gmail.com' })).toHaveCount(0);
});
