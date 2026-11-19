import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M03-07-5 — Manager Proyectos — Eliminar adjunto de tarea', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await page.goto('/Tasks/Create', { waitUntil: 'domcontentloaded' });
  await page.locator('#title').fill(`QA M03-07 Adjunto ${Date.now()}`); await page.locator('#description').fill('Fixture temporal para eliminar adjunto.');
  const project = page.locator('#projectId option').filter({ hasText: /QA/i }).first(); await expect(project).toBeAttached(); await page.locator('#projectId').selectOption(await project.getAttribute('value') as string);
  await page.waitForFunction(() => document.querySelectorAll('#sectionId option').length > 1); await page.locator('#sectionId').selectOption(await page.locator('#sectionId option').nth(1).getAttribute('value') as string); await page.locator('#btnSubmit').click(); await page.waitForURL(/Tasks\/Details\//i);
  await page.getByRole('tab', { name: /Archivos/i }).click(); await page.locator('#fileInput').setInputFiles('tests/fixtures/qa-attachment.txt'); await expect(page.locator('.file-item').filter({ hasText: 'qa-attachment.txt' })).toHaveCount(1, { timeout: 20_000 });
  await page.locator('.file-item').filter({ hasText: 'qa-attachment.txt' }).first().locator('button[title="Eliminar"]').click(); await page.getByRole('button', { name: 'Eliminar', exact: true }).click();
  await expect(page.locator('.file-item').filter({ hasText: 'qa-attachment.txt' })).toHaveCount(0, { timeout: 20_000 }); await page.reload({ waitUntil: 'networkidle' }); await page.getByRole('tab', { name: /Archivos/i }).click(); await expect(page.locator('.file-item').filter({ hasText: 'qa-attachment.txt' })).toHaveCount(0, { timeout: 20_000 });
  await testInfo.attach('manager-proyectos-adjunto-eliminado', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
