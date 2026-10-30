import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M09-08-7 — Super Administrador — Generar reporte de asistencia', async ({ page }) => {
  test.setTimeout(60_000);
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select('QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/Attendance/Reports');
  const reports = page.locator('table').nth(1);
  const before = await reports.locator('tbody tr').count();
  await page.getByRole('button', { name: /Generar PDF/i }).click();
  await page.waitForTimeout(1200);
  await expect(reports.locator('tbody tr')).toHaveCount(before + 1);
});
