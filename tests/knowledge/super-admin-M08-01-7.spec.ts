import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M08-01-7 — Super Administrador — Consultar base de conocimiento', async ({ page }) => {
  test.setTimeout(45_000);
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
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
  await page.goto('/KnowledgeBase');
  await expect(page).toHaveURL(/\/KnowledgeBase/);
  await expect(page.locator('body')).not.toContainText(/Sin permiso|Acceso denegado|403/i);
  await expect(page.locator('body')).toContainText(/Base de conocimiento|artículo|categoría/i);
  const article = page.getByRole('link').filter({ hasText: /artículo|soporte|ayuda/i }).first();
  if (await article.count()) {
    await article.click();
    await expect(page.locator('body')).not.toContainText(/Sin permiso|Acceso denegado|403/i);
  }
});
