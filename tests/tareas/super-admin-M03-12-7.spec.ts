import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M03-12-7 — Super Administrador — Comentar una tarea', async ({ page }) => {
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
  await page.goto('/Tasks/Details/8b947d76-1b0b-49e4-a946-15dae541bd9e');
  await page.getByRole('tab', { name: /Comentarios/i }).click();
  const text = `Comentario QA M03-12 persistente ${Date.now()}`;
  await page.getByRole('textbox', { name: /Escritura un Comentario/i }).fill(text);
  await page.getByRole('button', { name: /Enviar/i }).click();
  const comment = page.locator('.comment-content-area').filter({ hasText: text }).first();
  await expect(comment).toContainText(text, { timeout: 20_000 });
  await expect(comment.locator('..')).toContainText(/QA Admin Super Sistema|admin@demo.com/);
  await page.reload();
  await page.getByRole('tab', { name: /Comentarios/i }).click();
  await expect(page.locator('.comment-content-area').filter({ hasText: text }).first()).toContainText(text, { timeout: 20_000 });
});
