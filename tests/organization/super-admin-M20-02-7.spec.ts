import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M20-02-7 — Super Administrador — Crear mi propia organización', async ({ page }) => {
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

  const name = `QA M20-02-7 ${Date.now()}`;
  await page.locator('a.nav-link').filter({ hasText: process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe' }).click();
  await page.locator('#org-create-btn').click();
  await page.locator('#swal-org-name').fill(name);
  await page.locator('#swal-org-desc').fill('Organización temporal para validar M20-02-7');
  await page.getByRole('button', { name: 'Crear', exact: true }).click();
  await expect(page.locator('body')).toContainText('Organización creada', { timeout: 20_000 });
  await expect(page.locator('body')).toContainText(name, { timeout: 20_000 });
});
