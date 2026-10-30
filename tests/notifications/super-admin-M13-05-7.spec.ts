import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M13-05-7 — Super Administrador — Activar o desactivar canal', async ({ page }) => {
  test.setTimeout(60_000);
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select('QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/NotificationCenter/Channels');
  const currentOrg = page.locator('#current-org-name');
  if ((await currentOrg.textContent())?.trim() !== 'Ribbit') {
    await page.locator('a.nav-link:has(#current-org-name)').click();
    await page.locator('.dropdown-menu.show a[data-org-id="15ddcf2e-115b-4d3d-8e9b-7bde960b65ca"]').click();
    await page.waitForTimeout(1_000); await page.goto('/NotificationCenter/Channels');
  }
  const telegram = page.locator('input.channel-toggle').nth(3);
  const slider = telegram.locator('xpath=..').locator('.slider');
  const initial = await telegram.isChecked();
  await slider.click(); await page.waitForTimeout(700); await page.reload();
  await expect(telegram).toBeChecked({ checked: !initial });
  await telegram.locator('xpath=..').locator('.slider').click();
  await page.waitForTimeout(700); await page.reload();
  await expect(telegram).toBeChecked({ checked: initial });
});
