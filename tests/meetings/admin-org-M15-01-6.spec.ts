import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M15-01-6 — Administrador Organización — Consultar reuniones', async ({ page }) => {
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto('/Meetings');
  await expect(page.locator('body')).toContainText(/Reuniones|Meetings/i);
  const detail = page.locator('a[href*="/Meetings/Detail/"], a[href*="/Meetings/Details/"]').first();
  if (await detail.count()) {
    await detail.click();
    await expect(page.locator('body')).toContainText(/Transcripci[oó]n|An[aá]lisis|Resumen|Reuni[oó]n/i);
  }
});
