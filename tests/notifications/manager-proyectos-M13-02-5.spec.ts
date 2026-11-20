import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test('M13-02-5 — Manager Proyectos — Configurar canales de notificación', async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const login = new LoginPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn('demo.manager@athenea.local', 'Abcd.1234');
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await page.getByText('QA Checkout Stripe', { exact: false }).last().click();
    await page.getByRole('button', { name: /Continuar/i, exact: true }).click();
  }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/NotificationCenter/Channels');
  await expect(page.locator('body')).toContainText(/Canales|Correo|WhatsApp|Telegram/i);
  await expect(page.locator('body')).toContainText(/No hay canales configurados/i);
  const evidence = 'test-results/manager-proyectos-M13-02-canales.png';
  await page.screenshot({ path: evidence, fullPage: true });
  await testInfo.attach('manager-proyectos-canales-notificacion', { path: evidence, contentType: 'image/png' });
});
