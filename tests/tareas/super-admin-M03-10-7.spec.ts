import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M03-10-7 — Super Administrador — Editar adjunto de comentario', async ({ page }) => {
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
  const attachment = page.locator('[data-comment-file-id]').filter({ hasText: 'qa-attachment.txt' }).first();
  await expect(attachment).toBeVisible();
  await attachment.locator('button[title="Renombrar archivo"]').click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').fill('qa-comment-renamed.txt');
  await dialog.getByRole('button', { name: /Guardar|Aceptar/i }).click();
  await expect(page.locator('[data-comment-file-id]').filter({ hasText: 'qa-comment-renamed.txt' }).first()).toBeVisible({ timeout: 20_000 });
  await page.reload();
  await page.getByRole('tab', { name: /Comentarios/i }).click();
  await expect(page.locator('[data-comment-file-id]').filter({ hasText: 'qa-comment-renamed.txt' }).first()).toBeVisible({ timeout: 20_000 });
});
