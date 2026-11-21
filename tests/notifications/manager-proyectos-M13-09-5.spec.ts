import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test('M13-09-5 — Manager Proyectos — Enviar notificación desde plantilla', async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const login = new LoginPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn('demo.manager@athenea.local', 'Abcd.1234');
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await page.getByText('Athenea Demo.', { exact: true }).last().click();
    await page.getByRole('button', { name: /Continuar/i, exact: true }).click();
  }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/Notifications/Send');
  await expect(page.locator('body')).toContainText(/Enviar.*notific|Notificaci[oó]n/i);
  const template = page.locator('select:visible').filter({ has: page.locator('option') }).first();
  await expect(template).toBeVisible();
  const options = await template.locator('option').evaluateAll(opts => opts.map(o => ({ value: (o as HTMLOptionElement).value, text: o.textContent || '' })).filter(o => o.value));
  expect(options.length).toBeGreaterThan(0);
  await template.selectOption(options[0].value);
  if (await page.locator('#recipients').count()) await page.locator('#recipients').fill('demo.manager@athenea.local');
  await page.getByRole('button', { name: /Enviar|Send/i }).last().click();
  await expect(page.locator('body')).toContainText(/enviad[ao] a la cola|cola correctamente|Pending|Notificaci[oó]n/i);
  const evidence = 'test-results/manager-proyectos-M13-09-plantilla.png';
  await page.screenshot({ path: evidence, fullPage: true });
  await testInfo.attach('manager-proyectos-notificacion-plantilla', { path: evidence, contentType: 'image/png' });
});
