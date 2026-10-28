import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M16-09-6 — Administrador Organización — Acceso restringido a reactivar', async ({ page }) => {
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'Athenea Demo'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await page.goto('/OrganizationSubscription/ViewPlan');
  const detail = page.locator('a[href*="Subscriptions/Details"], a[href*="Subscription"]').first();
  await expect(detail).toBeVisible({ timeout: 15_000 });
  const href = await detail.getAttribute('href');
  if (!href) throw new Error('No se encontró el detalle de suscripción cancelada.');
  await page.goto(href);
  await expect(page.locator('body')).toContainText(/Acceso restringido|No tienes permiso|Sin permiso|No autorizado|Acceso denegado|Forbidden/i);
});
