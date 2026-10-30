import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M13-02-7 — Super Administrador — Configurar canales de notificación', async ({ page }) => {
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
    await page.waitForTimeout(1_000);
    await page.goto('/NotificationCenter/Channels');
  }
  const whatsapp = page.locator('input.channel-toggle').nth(1);
  const whatsappSlider = whatsapp.locator('xpath=..').locator('.slider');
  const initial = await whatsapp.isChecked();
  await whatsappSlider.click();
  await page.waitForTimeout(700);
  await page.reload();
  await expect(whatsapp).toBeChecked({ checked: !initial });
  await whatsapp.locator('xpath=..').locator('.slider').click();
  await page.waitForTimeout(700);
  await page.reload();
  await expect(whatsapp).toBeChecked({ checked: initial });
});
