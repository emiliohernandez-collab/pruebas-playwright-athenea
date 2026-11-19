import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M04-02-5 — Manager Proyectos — Registrar tiempo en una tarea', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!); if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); const taskUrl = '/Tasks/Details/8b947d76-1b0b-49e4-a946-15dae541bd9e'; await page.goto(taskUrl); await page.getByRole('tab', { name: /Tiempo/i }).click(); const description = `Registro QA M04-02 ${Date.now()}`; await page.locator('#teHours').fill('0.5'); await page.locator('#teDescription').fill(description); await page.locator('#btnAddTimeEntry').click(); await page.waitForURL(/\/Tasks\/(Index|Details\/)/i); await page.goto(taskUrl); await page.getByRole('tab', { name: /Tiempo/i }).click(); await expect(page.locator('#timeEntriesContent')).toContainText(description, { timeout: 20_000 }); await expect(page.locator('#timeEntriesContent')).toContainText(/0\.5h|Pendiente/i); await testInfo.attach('manager-proyectos-registro-tiempo', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
