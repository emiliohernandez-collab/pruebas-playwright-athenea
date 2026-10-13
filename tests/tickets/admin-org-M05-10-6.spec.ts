import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-10-6 — Administrador Organización — Editar política SLA', async ({ page }) => {
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
  await page.goto('/Tickets/AdminSLAs');
  await expect(page.locator('body')).toContainText(/Pol[ií]ticas SLA/i);
  const row = page.getByRole('row').filter({ hasText: 'QA M05-09' }).first();
  await expect(row).toBeVisible();
  await row.getByRole('button').first().click();
  const dialog = page.getByRole('dialog');
  const updated = `QA M05-10 editado ${Date.now()}`;
  await dialog.getByRole('textbox').first().fill(updated);
  const numbers = dialog.getByRole('spinbutton');
  for (let i = 0; i < await numbers.count(); i++) await numbers.nth(i).fill('90');
  await dialog.getByRole('button', { name: /Guardar|Actualizar/i }).click();
  await expect(page.locator('body')).toContainText(updated);
  await page.reload();
  await expect(page.locator('body')).toContainText(updated);
});
