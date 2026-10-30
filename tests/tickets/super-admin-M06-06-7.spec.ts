import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M06-06-7 — Super Administrador — Quitar miembro de grupo', async ({ page }) => {
  test.setTimeout(60_000);
  test.skip(!process.env.ATHENA_USER && !process.env.ATHENEA_USER, 'Faltan credenciales');
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
  await page.goto('/Tickets/AdminGroups');
  await expect(page.locator('body')).toContainText(/Grupos de soporte/i);
  await page.getByRole('button', { name: /Agregar|Nuevo grupo|Crear grupo/i }).first().click();
  const group = `QA M06-06 ${Date.now()}`;
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').first().fill(group);
  await dialog.getByRole('button', { name: /Guardar|Crear/i }).click();
  const row = page.getByRole('row').filter({ hasText: group }).first();
  await expect(row).toBeVisible();
  await row.getByRole('button').first().click();
  const memberDialog = page.getByRole('dialog');
  await memberDialog.getByRole('combobox').selectOption({ index: 1 });
  await memberDialog.getByRole('button', { name: /Agregar/i }).first().click();
  await memberDialog.getByRole('button', { name: /Guardar/i }).click();
  await row.getByRole('button').first().click();
  const editDialog = page.getByRole('dialog');
  await expect(editDialog).toContainText(/Demo|miembro/i);
  const memberText = editDialog.getByText(/Demo|miembro/i).first();
  await memberText.locator('..').getByRole('button').last().click();
  await editDialog.getByRole('button', { name: /Guardar/i }).click();
  await row.getByRole('button').first().click();
  await expect(page.getByRole('dialog')).toContainText(/No hay miembros en este grupo/i);
});
