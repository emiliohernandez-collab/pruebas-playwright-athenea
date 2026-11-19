import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M03-10-5 — Manager Proyectos — Editar adjunto de comentario', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await page.goto('/Tasks/Create', { waitUntil: 'domcontentloaded' });
  const marker = Date.now(); await page.locator('#title').fill(`QA M03-10 Comentario ${marker}`); await page.locator('#description').fill('Fixture temporal para editar adjunto de comentario.');
  const project = page.locator('#projectId option').filter({ hasText: /QA/i }).first(); await expect(project).toBeAttached(); await page.locator('#projectId').selectOption(await project.getAttribute('value') as string); await page.waitForFunction(() => document.querySelectorAll('#sectionId option').length > 1); await page.locator('#sectionId').selectOption(await page.locator('#sectionId option').nth(1).getAttribute('value') as string); await page.locator('#btnSubmit').click(); await page.waitForURL(/Tasks\/Details\//i);
  await page.getByRole('tab', { name: /Comentarios/i }).click(); await page.getByRole('textbox', { name: /Escritura un Comentario/i }).fill(`Comentario QA M03-10 ${marker}`); await page.locator('#commentFileInput').setInputFiles('tests/fixtures/qa-attachment.txt'); await page.getByRole('button', { name: /Enviar/i }).click();
  const attachment = page.locator('[data-comment-file-id]').filter({ hasText: 'qa-attachment.txt' }).first(); await expect(attachment).toBeVisible({ timeout: 20_000 }); await attachment.locator('button[title="Renombrar archivo"]').click(); const dialog = page.getByRole('dialog'); await dialog.getByRole('textbox').fill(`qa-comment-renamed-${marker}.txt`); await dialog.getByRole('button', { name: /Guardar|Aceptar/i }).click(); await expect(page.locator('[data-comment-file-id]').filter({ hasText: `qa-comment-renamed-${marker}.txt` })).toBeVisible({ timeout: 20_000 }); await page.reload({ waitUntil: 'networkidle' }); await page.getByRole('tab', { name: /Comentarios/i }).click(); await expect(page.locator('[data-comment-file-id]').filter({ hasText: `qa-comment-renamed-${marker}.txt` })).toBeVisible({ timeout: 20_000 });
  await testInfo.attach('manager-proyectos-adjunto-comentario-editado', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
