import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M11-16-7 — Super Administrador — Vaciar un rol del sistema', async ({ page }) => {
  test.setTimeout(60_000);
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select('QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/Roles/ManageUsers/406da1ea-7fdc-4df7-879b-5d296955bc4d');
  const member = page.getByRole('row').filter({ hasText: 'emilyhdzp@gmail.com' });
  if (await member.count() === 0) {
    await page.locator('#select2-userSelect-container').click();
    await page.locator('.select2-search__field').fill('emilyhdzp@gmail.com');
    await page.getByRole('option', { name: /emilyhdzp@gmail\.com/i }).click();
    await page.getByRole('button', { name: /Asignar rol/i }).click();
    await page.getByRole('button', { name: /Sí, asignar rol/i }).click();
  }
  const row = page.getByRole('row').filter({ hasText: 'emilyhdzp@gmail.com' }).first();
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: /Eliminar/i }).click();
  await page.getByRole('button', { name: /Sí, Eliminar de Rol/i }).click();
  await expect(page.getByRole('row').filter({ hasText: 'emilyhdzp@gmail.com' })).toHaveCount(0);
});
