import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M11-19-7 — Super Administrador — Eliminar usuario del sistema', async ({ page }) => {
  test.setTimeout(60_000);
  test.skip(!process.env.ATHENEA_TEST_USER_PASSWORD, 'Falta contraseña temporal del fixture');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select('QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded();

  const email = `qa.super.m11-19-7.${Date.now()}@example.invalid`;
  await page.goto('/Users/Create');
  await page.locator('#Email').fill(email);
  await page.locator('#Password').fill(process.env.ATHENEA_TEST_USER_PASSWORD!);
  await page.locator('#Nombre').fill('QA Fixture');
  await page.locator('#Apellido1').fill('Eliminar');
  await page.getByRole('button', { name: /Crear Usuario/i }).click();
  await page.getByRole('button', { name: /Continuar/i }).click();
  await page.goto('/Users');
  const search = page.locator('input[name="search"]');
  await search.fill(email); await page.getByRole('button', { name: /Buscar/i }).click();
  const row = page.getByRole('row').filter({ hasText: email }).first();
  await expect(row).toBeVisible();
  await row.locator('a').last().click();
  await page.locator('#confirmDeleteBtn').click();
  await expect(page.locator('button.swal2-confirm')).toBeVisible();
  await page.locator('button.swal2-confirm').click();
  await expect(page).toHaveURL(/\/Users$/);
  await search.fill(email); await page.getByRole('button', { name: /Buscar/i }).click();
  await expect(page.getByRole('row').filter({ hasText: email })).toHaveCount(0);
});
