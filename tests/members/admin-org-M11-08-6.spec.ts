import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M11-08-6 — Administrador Organización — Reenviar invitación', async ({ page }) => {
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
  const pending = page.locator('tr').filter({ hasText: /Pendiente|qa-invite-/i }).first();
  await expect(pending).toBeVisible();
  await pending.scrollIntoViewIfNeeded();
  const resend = pending.getByRole('button', { name: /Reenviar/i });
  if (await resend.count()) await resend.click(); else await pending.locator('button').last().click();
  if (await page.getByRole('button', { name: /Confirmar|Sí|Reenviar/i }).count()) await page.getByRole('button', { name: /Confirmar|Sí|Reenviar/i }).last().click();
  await expect(page.locator('body')).toContainText(/reenviad|enviad|Pendiente/i);
});
