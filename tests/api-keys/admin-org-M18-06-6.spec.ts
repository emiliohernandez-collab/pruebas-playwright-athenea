import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M18-06-6 — Administrador Organización — Revocar llave API', async ({ page }) => {
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'Athenea Demo'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/ApiKeys/Create');
  const name = `QA M18-06 ${Date.now()}`;
  await page.getByRole('textbox').first().fill(name);
  await page.locator('select').first().selectOption({ index: 1 });
  await page.getByRole('button', { name: /Guardar|Crear|Generar/i }).last().click();
  await expect(page).toHaveURL(/ApiKeys/i, { timeout: 20_000 });
  await expect(page.locator('body')).toContainText(name);
  const revoke = page.getByRole('button', { name: /Revocar|Revoke/i }).first();
  await expect(revoke).toBeVisible({ timeout: 15_000 });
  await revoke.click();
  const confirm = page.locator('#revokeModal').getByRole('button', { name: /Confirmar|Sí|Revocar|Revoke/i }).last();
  await expect(confirm).toBeVisible({ timeout: 8_000 });
  await confirm.click();
  await expect(page.locator('body')).toContainText(/Revocada|Revoked/i, { timeout: 15_000 });
});
