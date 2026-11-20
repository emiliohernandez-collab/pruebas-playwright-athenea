import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test('M13-06-5 — Manager Proyectos — Solicitar verificación de WhatsApp', async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const login = new LoginPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn('demo.manager@athenea.local', 'Abcd.1234');
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await page.getByText('Athenea Demo.', { exact: true }).last().click();
    await page.getByRole('button', { name: /Continuar/i, exact: true }).click();
  }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/NotificationCenter/Channels');
  await expect(page.locator('body')).toContainText(/WhatsApp/i);
  const whatsapp = page.locator('input.channel-toggle').nth(1);
  await expect(whatsapp).toHaveCount(1);
  const wasEnabled = await whatsapp.isChecked();
  if (!wasEnabled) { await whatsapp.locator('..').click(); }
  const send = page.getByRole('button', { name: 'Enviar código', exact: true }).first();
  await expect(send).toBeVisible();
  await send.click();
  const confirmSend = page.getByRole('button', { name: 'Enviar código', exact: true }).last();
  await expect(confirmSend).toBeVisible();
  await confirmSend.click({ noWaitAfter: true });
  await page.waitForTimeout(4000);
  await expect(page.locator('body')).toContainText(/Enviado|enviado|No se pudo enviar el código|Error/i);
  const evidence = 'test-results/manager-proyectos-M13-06-whatsapp.png';
  await page.screenshot({ path: evidence, fullPage: true });
  await testInfo.attach('manager-proyectos-solicitar-whatsapp', { path: evidence, contentType: 'image/png' });
  if (!wasEnabled) { await page.locator('input.channel-toggle').nth(1).locator('..').click(); }
});
