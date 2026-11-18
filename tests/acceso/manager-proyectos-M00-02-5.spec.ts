import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { OrganizationSwitcherPage } from '../pages/OrganizationSwitcherPage';

test('M00-02-5 — Manager Proyectos — Cambiar de organización', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  const switcher = new OrganizationSwitcherPage(page);
  const original = process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe';
  const target = process.env.ATHENEA_OTHER_ORGANIZATION ?? 'Ribbit';

  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await page.getByText(original, { exact: true }).click();
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await switcher.open();
  await switcher.switchTo(target);
  await expect(page).toHaveURL(/Dashboard/i);
  await dashboard.expectLoaded();
  await testInfo.attach('manager-proyectos-organizacion-cambiada', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  await switcher.open();
  await switcher.switchTo(original);
  await expect(page).toHaveURL(/Dashboard/i);
});
