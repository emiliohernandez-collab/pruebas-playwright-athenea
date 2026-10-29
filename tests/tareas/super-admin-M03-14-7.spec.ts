import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M03-14-7 — Super Administrador — Eliminar comentario propio', async ({ page }) => {
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
  const text = `Comentario QA M03-14 eliminar ${Date.now()}`;
  await page.getByRole('textbox', { name: /Escritura un Comentario/i }).fill(text);
  await page.getByRole('button', { name: /Enviar/i }).click();
  const comment = page.locator('[id^="comment-content-"]').filter({ hasText: text }).first();
  await expect(comment).toBeVisible({ timeout: 20_000 });
  const commentId = await comment.getAttribute('id');
  const container = page.locator(`#${commentId}`).locator('xpath=ancestor::*[starts-with(@id,"comment-")][1]');
  await container.locator('button').first().click();
  await page.locator('a:visible').filter({ hasText: /^Eliminar$/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Eliminar', exact: true }).click();
  await expect(page.locator(`[id="${commentId}"]`)).toHaveCount(0, { timeout: 20_000 });
  await page.reload();
  await page.getByRole('tab', { name: /Comentarios/i }).click();
  await expect(page.locator('[id^="comment-content-"]').filter({ hasText: text })).toHaveCount(0, { timeout: 20_000 });
});
