import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M04-06-6 — Administrador Organización — Rechazar registro de tiempo', async ({ page }) => {
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
  await page.goto('/TimesheetApproval/Index');
  await expect(page.locator('body')).toContainText(/Aprobación de tiempo/i);
  const pending = page.getByRole('row').filter({ hasText: 'Registro QA M04-02' }).first();
  await expect(pending).toBeVisible();
  await pending.getByRole('button').nth(1).click();
  const dialog = page.getByRole('dialog');
  if (await dialog.isVisible().catch(() => false)) {
    const field = dialog.getByRole('textbox').first();
    if (await field.isVisible().catch(() => false)) await field.fill('Registro creado para validar rechazo en QA');
    await dialog.getByRole('button', { name: /Rechazar|Guardar|Aceptar|Confirmar/i }).click();
  }
  await page.waitForTimeout(500);
  await page.reload();
  await expect(page.getByRole('row').filter({ hasText: 'Registro QA M04-02' })).toHaveCount(0);
});
