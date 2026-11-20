import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test('M13-02-5 — Manager Proyectos — Configurar canales de notificación', async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const login = new LoginPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn('demo.manager@athenea.local', 'Abcd.1234');
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await page.getByText('Athenea Demo.', { exact: true }).last().click();
    await page.getByRole('button', { name: /Continuar/i, exact: true }).click();
  }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/NotificationCenter/Channels');
  await expect(page.locator('body')).toContainText(/Canales|Correo|WhatsApp|Telegram/i);
  const channel = page.locator('input.channel-toggle').first();
  await expect(channel).toHaveCount(1);
  const before = await channel.isChecked();
  await channel.locator('..').click(); await page.reload();
  await expect(page.locator('input.channel-toggle').first()).toBeChecked({ checked: !before });
  const evidence = 'test-results/manager-proyectos-M13-02-canales.png';
  await page.screenshot({ path: evidence, fullPage: true });
  await testInfo.attach('manager-proyectos-canales-notificacion', { path: evidence, contentType: 'image/png' });
  await page.locator('input.channel-toggle').first().locator('..').click(); await page.reload();
  await expect(page.locator('input.channel-toggle').first()).toBeChecked({ checked: before });
});
