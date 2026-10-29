import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M03-11-7 — Super Administrador — Eliminar adjunto de comentario', async ({ page }) => {
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
  const comment = page.locator('.comment-content-area').filter({ hasText: 'Comentario QA con adjunto M03-09' }).first();
  const attachment = comment.locator('[data-comment-file-id]').first();
  await expect(attachment).toBeVisible();
  await attachment.locator('button[title="Eliminar"]').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Eliminar', exact: true }).click();
  await expect(comment.locator('[data-comment-file-id]')).toHaveCount(0, { timeout: 20_000 });
  await expect(comment).toContainText('Comentario QA con adjunto M03-09');
  await page.reload();
  await page.getByRole('tab', { name: /Comentarios/i }).click();
  const reloadedComment = page.locator('.comment-content-area').filter({ hasText: 'Comentario QA con adjunto M03-09' }).first();
  await expect(reloadedComment.locator('[data-comment-file-id]')).toHaveCount(0, { timeout: 20_000 });
  await expect(reloadedComment).toContainText('Comentario QA con adjunto M03-09');
});
