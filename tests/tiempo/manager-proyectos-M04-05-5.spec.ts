import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M04-05-5 — Manager Proyectos — Aprobar registro de tiempo', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  page.on('dialog', async dialog => { await dialog.accept(); });
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!); if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await page.goto('/TimesheetApproval/Index', { waitUntil: 'networkidle' }); await expect(page.locator('body')).toContainText(/Aprobación de tiempo/i); const description = 'Registro QA M04-03 editado'; const pending = page.getByRole('row').filter({ hasText: description }).first(); await expect(pending).toBeVisible({ timeout: 20_000 }); await pending.getByRole('button').first().click(); await page.waitForTimeout(1500); await page.reload({ waitUntil: 'networkidle' }); await expect(page.getByRole('row').filter({ hasText: description })).toHaveCount(0); await testInfo.attach('manager-proyectos-tiempo-aprobado', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
