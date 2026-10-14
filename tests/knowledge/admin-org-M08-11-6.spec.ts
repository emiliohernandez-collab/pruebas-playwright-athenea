import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M08-11-6 — Administrador Organización — Vincular artículo a ticket', async ({ page }) => {
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
  const ticketId = process.env.ATHENEA_TICKET_ID;
  test.skip(!ticketId, 'Falta ATHENEA_TICKET_ID con el ticket QA preparado');
  await page.goto(`/Tickets/Details/${ticketId}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#ticketSubject')).toBeVisible();
  await expect(page.locator('body')).toContainText(/Artículos relacionados|artículos/i);
  const expectedArticle = process.env.ATHENEA_ARTICLE_TITLE ?? 'QA M08-10 1791869232354';
  const linked = page.locator('#kbCard').getByRole('link', { name: new RegExp(expectedArticle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) });
  await expect(linked).toBeVisible();
  await expect(linked).toContainText(expectedArticle);
});
