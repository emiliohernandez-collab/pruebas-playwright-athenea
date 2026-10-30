import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M10-06-7 — Super Administrador — Cargar festivos oficiales de México', async ({ page }) => {
  test.setTimeout(60_000);
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select('QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/Holidays');
  const rows = page.locator('table tbody tr');
  const before = await rows.count();
  const datesBefore = await rows.locator('td').first().allTextContents();
  await page.getByRole('button', { name: /Cargar festivos de México/i }).click();
  await page.waitForTimeout(1000);
  const after = page.locator('table tbody tr');
  const datesAfter = await after.locator('td').first().allTextContents();
  expect(new Set(datesAfter).size).toBe(datesAfter.length);
  await expect(after).toHaveCount(before);
  expect(datesAfter.sort()).toEqual(datesBefore.sort());
});
