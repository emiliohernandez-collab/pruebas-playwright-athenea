import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M03-13-6 — Administrador Organización — Editar comentario propio', async ({ page }) => {
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
  await page.getByRole('tab', { name: /Comentarios/i }).click().catch(() => {});

  const original = 'Comentario QA M03-13 editado';
  const updated = 'Comentario QA M03-13 editado nuevamente';
  const comment = page.locator('[id^="comment-content-"]').filter({ hasText: original }).first();
  await expect(comment).toBeVisible();
  const commentId = await comment.getAttribute('id');
  const container = page.locator(`#${commentId}`).locator('xpath=ancestor::*[starts-with(@id,"comment-")][1]');
  await container.locator('button').first().click();
  await page.locator('a:visible').filter({ hasText: /^Editar$/ }).click();

  const editor = container.locator('textarea[id^="comment-edit-input-"]');
  await expect(editor).toBeVisible();
  await editor.fill(updated);
  await container.getByRole('button', { name: /Guardar|Aceptar/i }).click();
  await expect(container.locator('[id^="comment-content-"]')).toContainText(updated);

  await page.reload();
  await page.getByRole('tab', { name: /Comentarios/i }).click().catch(() => {});
  await expect(page.locator('[id^="comment-content-"]').filter({ hasText: updated }).first()).toBeVisible();
});
