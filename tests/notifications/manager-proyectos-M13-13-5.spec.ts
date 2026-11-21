import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test('M13-13-5 — Manager Proyectos — Cancelar notificación en cola', async ({ page }, testInfo) => {
  test.setTimeout(90000);
  const login = new LoginPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn('demo.manager@athenea.local', 'Abcd.1234');
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await page.getByText('Athenea Demo.', { exact: true }).last().click(); await page.getByRole('button', { name: /Continuar/i, exact: true }).click(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await page.goto('/Notifications/Send');
  const advanced = page.getByText('Opciones avanzadas', { exact: true });
  if (await advanced.count() && !(await page.locator('#subject').isVisible())) await advanced.first().click();
  if (await page.locator('#noTemplate').count()) await page.locator('#noTemplate').check({ force: true });
  const subject = `QA Cancel M13-13 Manager ${Date.now()}`;
  await page.locator('#notificationType').selectOption('0'); await page.locator('#subject').fill(subject);
  await page.locator('#body').fill('Notificación QA programada para cancelación.'); await page.locator('#recipients').fill('demo.manager@athenea.local');
  if (!(await page.locator('#priority').isVisible()) && await page.getByRole('button', { name: /Opciones avanzadas/i }).count()) await page.getByRole('button', { name: /Opciones avanzadas/i }).click();
  if (await page.locator('#priority').count()) await page.locator('#priority').selectOption({ label: 'Normal' });
  const scheduled = new Date(Date.now() + 120000); const local = new Date(scheduled.getTime() - scheduled.getTimezoneOffset() * 60000).toISOString().slice(0, 16); await page.locator('#scheduledAt').fill(local);
  await page.locator('#btnSend').click(); await expect(page.locator('body')).toContainText(/programad|enviad|cola|éxito/i);
  await page.goto('/Notifications/History?pageNumber=0&pageSize=50'); const matching = page.getByText(subject, { exact: true }).first(); await expect(matching).toBeVisible({ timeout: 20000 });
  const row = matching.locator('xpath=ancestor::*[self::tr or contains(@class,"card")][1]'); const detail = row.getByRole('link', { name: /Ver detalles/i }); if (await detail.count()) await detail.click(); else await matching.click();
  await expect(page.locator('body')).toContainText(/programad|pendiente|cola/i); const cancel = page.getByRole('button', { name: /Cancelar/i }).first(); await expect(cancel).toBeVisible(); page.once('dialog', dialog => dialog.accept()); await cancel.click(); await expect(page.locator('body')).toContainText(/Cancelad/i);
  const evidence = 'test-results/manager-proyectos-M13-13-cancelada.png'; await page.screenshot({ path: evidence, fullPage: true }); await testInfo.attach('manager-proyectos-notificacion-cancelada', { path: evidence, contentType: 'image/png' });
});
