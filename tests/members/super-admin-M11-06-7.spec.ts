import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M11-06-7 — Super Administrador — Editar perfil de otro miembro', async ({ page }) => {
  test.setTimeout(45_000);
  page.setDefaultTimeout(5_000);
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  console.log('M11-06: login abierto');
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  console.log('M11-06: sesión iniciada', page.url());
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  console.log('M11-06: dashboard cargado');
  await page.goto('/OrganizationMembers');
  await page.waitForLoadState('domcontentloaded');
  console.log('M11-06: miembros cargado', page.url());

  const memberRow = page.locator('tr').filter({ hasText: /demo\.adminorg@athenea\.local|demo\.qa-m11@athenea\.local/i }).first();
  await expect(memberRow).toBeVisible();
  console.log('M11-06: miembro encontrado');
  await memberRow.scrollIntoViewIfNeeded();
  const actionButtons = memberRow.locator('button');
  const edit = memberRow.getByRole('link', { name: 'Editar', exact: true });
  await expect(edit).toBeVisible();
  await edit.click();
  console.log('M11-06: edición abierta');
  await expect(page.getByRole('heading', { name: /Editar perfil/i })).toBeVisible();
  const name = page.getByLabel('Nombre', { exact: true });
  const phone = page.getByLabel('Teléfono', { exact: true });
  const originalName = await name.inputValue();
  const originalPhone = await phone.inputValue();
  const testName = `${originalName} QA`;
  const testPhone = '5550000000';
  await name.fill(testName);
  await phone.fill(testPhone);
  await page.getByRole('button', { name: /Guardar|Actualizar/i }).click();
  console.log('M11-06: cambio guardado');
  await expect(page).toHaveURL(/OrganizationMembers/i);

  await page.reload();
  const updatedRow = page.locator('tr').filter({ hasText: /demo\.adminorg@athenea\.local/i }).first();
  await updatedRow.getByRole('link', { name: 'Editar', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Editar perfil/i })).toBeVisible();
  await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue(testName);
  await expect(page.getByLabel('Teléfono', { exact: true })).toHaveValue(testPhone);

  await page.getByLabel('Nombre', { exact: true }).fill(originalName);
  await page.getByLabel('Teléfono', { exact: true }).fill(originalPhone);
  await page.getByRole('button', { name: /Guardar|Actualizar/i }).click();
  await expect(page).toHaveURL(/OrganizationMembers/i);
});
