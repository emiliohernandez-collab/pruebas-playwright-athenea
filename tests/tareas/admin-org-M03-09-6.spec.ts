import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M03-09-6 — Administrador Organización — Adjuntar archivo a un comentario', async ({ page }) => {
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
  await page.getByRole('textbox', { name: /Escritura un Comentario/i }).fill('Comentario QA con adjunto M03-09');
  const fileInput = page.locator('#commentFileInput');
  await fileInput.setInputFiles('tests/fixtures/qa-attachment.txt');
  await page.getByRole('button', { name: /Enviar/i }).click();
  await expect(page.locator('#commentsContent')).toContainText('Comentario QA con adjunto M03-09', { timeout: 20_000 });
  await expect(page.locator('#commentsContent')).toContainText('qa-attachment.txt', { timeout: 20_000 });
  await page.waitForTimeout(2_000);
  await page.reload();
  await page.getByRole('tab', { name: /Comentarios/i }).click();
  await expect(page.locator('#commentsContent')).toContainText('Comentario QA con adjunto M03-09', { timeout: 20_000 });
  await expect(page.locator('#commentsContent')).toContainText('qa-attachment.txt', { timeout: 20_000 });
});
