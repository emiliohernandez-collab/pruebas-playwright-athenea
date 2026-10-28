import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M15-07-6 — Administrador Organización — Iniciar análisis con IA', async ({ page }) => {
  test.setTimeout(60_000);
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    const expected = page.getByText(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe', { exact: true });
    if (await expected.count()) await expected.click(); else await page.getByText('Athenea Demo.', { exact: true }).click();
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto('/Meetings');
  await page.getByRole('button', { name: /Subir|Nueva reuni[oó]n|Cargar/i }).last().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').fill('QA VALID TRANSCRIBE M15-07-6');
  await dialog.locator('input[type="file"]').first().setInputFiles('C:/Users/emily/OneDrive/Documentos/pruebas-playwright/qa-meeting-with-audio.mp4');
  await dialog.getByRole('button', { name: /Subir Grabación/i }).last().click();
  await expect(page.locator('body')).toContainText(/Completed/i, { timeout: 60_000 });
  await page.reload();
  const row = page.locator('tr').filter({ hasText: 'QA VALID TRANSCRIBE M15-07-6' }).first();
  await expect(row).toBeVisible({ timeout: 15_000 });
  await row.getByRole('link').click();
  const transcribe = page.getByRole('button', { name: /Transcripci[oó]n|Transcribir/i }).first();
  await expect(transcribe).toBeVisible({ timeout: 15_000 });
  await transcribe.click();
  let analysisReady = false;
  for (let i = 0; i < 18; i++) {
    const body = await page.locator('body').innerText();
    if (/Analizar|Iniciar an[aá]lisis|Resumen|Acuerdos|Tareas sugeridas/i.test(body)) { analysisReady = true; break; }
    await page.waitForTimeout(5_000);
    await page.reload();
  }
  const analyze = page.getByRole('button', { name: /Analizar|Análisis IA|Iniciar an[aá]lisis/i }).first();
  expect(analysisReady).toBeTruthy();
  await expect(analyze).toBeVisible({ timeout: 15_000 });
  await analyze.click();
  await expect(page.locator('body')).toContainText(/Análisis|resumen|acuerdos|tareas|procesando|completad/i, { timeout: 30_000 });
});
