import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M11-02-7 — Super Administrador — Invitar miembro', async ({ page }) => {
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
  await page.goto('/OrganizationMembers/Invite');
  await expect(page.locator('body')).not.toContainText(/Sin permiso|Acceso denegado|403/i);
  const email = `qa-invite-${Date.now()}@example.com`;
  const input = page.locator('input[type="email"]').first();
  await expect(input).toBeVisible();
  await input.fill(email);
  const role = page.locator('select').first();
  if (await role.count()) {
    const adminOrg = role.locator('option').filter({ hasText: /Administrador(?: de)? Organización/i }).first();
    if (await adminOrg.count()) await role.selectOption(await adminOrg.getAttribute('value') as string);
    else if (await role.locator('option').count() > 1) await role.selectOption({ index: 1 });
  }
  await page.getByRole('button', { name: /Invitar|Enviar/i }).first().click();
  await expect(page.locator('body')).toContainText(/Pendiente|invitación|invitacion|enviad/i);
});
