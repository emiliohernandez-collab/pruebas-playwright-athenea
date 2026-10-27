import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M13-24-6 — Administrador Organización — Marcar todas como leídas', async ({ page }) => {
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
  await page.locator('#markAllReadBtn').click();
  const confirm = page.getByRole('button', { name: /Sí|mark|Todos/i }).last();
  await expect(confirm).toBeVisible();
  await confirm.click();
  await expect(page.locator('body')).toContainText(/No leído\s+0/i);
  await page.reload();
  await expect(page.locator('body')).toContainText(/No leído\s+0/i);
});
