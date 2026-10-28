import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M20-07-6 — Administrador Organización — Eliminar mi organización no disponible', async ({ page }) => {
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);

  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await org.select(process.env.ATHENEA_ORGANIZATION ?? 'Athenea Demo');
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto('/OrganizationSettings');

  await expect(page.locator('body')).toContainText(/organización|configuración/i);
  const deleteControls = page.getByRole('button', { name: /Eliminar.*organizaci[oó]n|Eliminar mi organizaci[oó]n/i });
  await expect(deleteControls).toHaveCount(0);
});
