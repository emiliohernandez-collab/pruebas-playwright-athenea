import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M12-13-7 — Super Administrador — Eliminar rol con reasignación', async ({ page }) => {
  test.setTimeout(90_000);
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select('QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  const roleName = `QA M12-13 ${Date.now()}`;
  await page.goto('/Roles/Create');
  await page.locator('#Name').fill(roleName);
  await page.locator('#Description').fill('Fixture temporal M12-13.');
  await page.getByRole('button', { name: /Crear rol/i }).click();
  await expect(page).toHaveURL(/\/Roles$/, { timeout: 15_000 });
  await page.waitForTimeout(1_500);
  await page.locator('#searchInput').fill(roleName); await page.locator('#searchInput').press('Tab'); await page.waitForTimeout(500);
  const created = page.getByRole('row').filter({ hasText: roleName }).first();
  await expect(created).toBeVisible();
  const manageHref = await created.locator('a[aria-label="Administrar Usuarios"]').getAttribute('href');
  const deleteHref = await created.locator('a[aria-label="Eliminar"]').getAttribute('href');
  await page.goto(manageHref!);
  await page.locator('#select2-userSelect-container').click();
  await page.locator('.select2-search__field').fill('emilyhdzp@gmail.com');
  await page.getByRole('option', { name: /emilyhdzp@gmail\.com/i }).click();
  await page.getByRole('button', { name: /Asignar rol/i }).click();
  await page.getByRole('button', { name: /Sí, asignar rol/i }).click();
  await expect(page.getByRole('row').filter({ hasText: 'emilyhdzp@gmail.com' })).toBeVisible();
  await page.goto(deleteHref!);
  const replacement = page.locator('#reassignToRoleId');
  await expect(replacement).toBeVisible();
  await replacement.selectOption({ label: 'Administrador Organización' });
  await page.getByRole('button', { name: /Eliminar rol/i }).click();
  await expect(page).toHaveURL(/\/Roles$/, { timeout: 15_000 });
  await page.waitForTimeout(1000);
  await expect(page.locator('body')).not.toContainText(roleName);
});
