import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M11-03-7 — Super Administrador — Cambiar rol de miembro', async ({ page }) => {
  test.setTimeout(60_000);
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
  await page.goto('/OrganizationMembers');
  const memberEmail = process.env.ATHENEA_MEMBER_EMAIL ?? 'emilyhdzp@gmail.com';
  const row = page.getByRole('row').filter({ hasText: memberEmail }).first();
  await expect(row).toBeVisible();
  await row.getByRole('link', { name: /Hacer ajustes/i }).click();
  const role = page.getByRole('combobox', { name: /Nuevo rol/i });
  await expect(role).toBeVisible();
  const original = await role.inputValue();
  const alternate = await role.locator('option').filter({ hasText: /Observador/i }).first().getAttribute('value');
  expect(alternate).toBeTruthy();
  await role.selectOption(alternate!);
  await page.getByRole('button', { name: /Guardar cambios/i }).click();
  await expect(page.locator('body')).toContainText(/guardad|actualiz/i);
  await page.reload();
  const changed = page.getByRole('row').filter({ hasText: memberEmail }).first();
  await expect(changed).toContainText(/Observador/i);
  await changed.getByRole('link', { name: /Hacer ajustes/i }).click();
  await page.getByRole('combobox', { name: /Nuevo rol/i }).selectOption(original);
  await page.getByRole('button', { name: /Guardar cambios/i }).click();
  await expect(page.locator('body')).toContainText(/guardad|actualiz/i);
});
