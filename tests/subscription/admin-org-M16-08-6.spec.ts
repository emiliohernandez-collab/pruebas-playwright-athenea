import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M16-08-6 — Administrador Organización — Cancelar suscripción', async ({ page }) => {
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'Athenea Demo'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await page.goto('/OrganizationSubscription/ViewPlan');
  await expect(page.locator('body')).toContainText(/suscripci[oó]n|plan|Business|Professional/i);
  const cancel = page.getByRole('button', { name: /Cancelar/i }).first();
  await expect(cancel).toBeVisible({ timeout: 15_000 });
  await cancel.click();
  await expect(page.locator('body')).toContainText(/cancelar|confirmar|periodo|suscripci[oó]n/i, { timeout: 10_000 });
  const confirm = page.getByRole('button', { name: /Confirmar|Cancelar suscripci[oó]n|Sí, cancelar/i }).last();
  await expect(confirm).toBeVisible({ timeout: 8_000 });
  await confirm.click();
  await expect(page.locator('body')).toContainText(/cancelad|final del periodo|cancellation|scheduled/i, { timeout: 15_000 });
});
