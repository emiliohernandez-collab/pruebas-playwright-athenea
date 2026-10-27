import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M13-23-6 — Administrador Organización — Marcar notificación como leída', async ({ page }) => {
  test.setTimeout(45_000);
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    const expected = page.getByText(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe', { exact: true });
    if (await expected.count()) await expected.click();
    else await page.getByText('Athenea Demo.', { exact: true }).click();
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto('/NotificationCenter');
  await expect(page.locator('body')).toContainText(/Centro de Notificaciones|Notificaciones/i);
  const before = Number((await page.locator('body').innerText()).match(/No leído\s+(\d+)/i)?.[1] ?? 0);
  expect(before).toBeGreaterThan(0);
  const menu = page.locator('button.dropdown-toggle').filter({ has: page.locator('i.mdi-dots-horizontal') }).first();
  await menu.click();
  await page.locator('.dropdown-menu.show a.mark-read-btn').first().click();
  await page.waitForTimeout(500);
  const after = Number((await page.locator('body').innerText()).match(/No leído\s+(\d+)/i)?.[1] ?? 0);
  expect(after).toBe(before - 1);
  await page.reload();
  const persisted = Number((await page.locator('body').innerText()).match(/No leído\s+(\d+)/i)?.[1] ?? 0);
  expect(persisted).toBe(after);
});
