import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M03-12-5 — Manager Proyectos — Comentar una tarea', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!); if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await page.goto('/Tasks/Create', { waitUntil: 'domcontentloaded' }); const marker = Date.now(); const text = `Comentario QA M03-12 ${marker}`;
  await page.locator('#title').fill(`QA M03-12 Comentario ${marker}`); await page.locator('#description').fill('Fixture temporal para comentar tarea.'); const project = page.locator('#projectId option').filter({ hasText: /QA/i }).first(); await expect(project).toBeAttached(); await page.locator('#projectId').selectOption(await project.getAttribute('value') as string); await page.waitForFunction(() => document.querySelectorAll('#sectionId option').length > 1); await page.locator('#sectionId').selectOption(await page.locator('#sectionId option').nth(1).getAttribute('value') as string); await page.locator('#btnSubmit').click(); await page.waitForURL(/Tasks\/Details\//i);
  await page.getByRole('tab', { name: /Comentarios/i }).click(); await page.getByRole('textbox', { name: /Escritura un Comentario/i }).fill(text); await page.getByRole('button', { name: /Enviar/i }).click(); const comment = page.locator('.comment-content-area').filter({ hasText: text }).first(); await expect(comment).toContainText(text, { timeout: 20_000 }); await page.reload({ waitUntil: 'networkidle' }); await page.getByRole('tab', { name: /Comentarios/i }).click(); await expect(page.locator('.comment-content-area').filter({ hasText: text }).first()).toContainText(text, { timeout: 20_000 }); await testInfo.attach('manager-proyectos-comentario', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
