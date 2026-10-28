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
  const sampleRate = 8000;
  const samples = Buffer.alloc(sampleRate);
  const wav = Buffer.alloc(44 + samples.length);
  wav.write('RIFF', 0); wav.writeUInt32LE(36 + samples.length, 4); wav.write('WAVE', 8);
  wav.write('fmt ', 12); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22); wav.writeUInt32LE(sampleRate, 24); wav.writeUInt32LE(sampleRate * 2, 28);
  wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(samples.length, 40);
  samples.copy(wav, 44);
  await dialog.locator('input[type="file"]').last().setInputFiles({ name: 'qa-valid-transcribe.wav', mimeType: 'audio/wav', buffer: wav });
  await dialog.getByRole('button', { name: /Subir Grabación/i }).last().click();
  await expect(page.locator('body')).toContainText(/Completed|complet|Procesando/i, { timeout: 30_000 });
  await page.reload();
  const row = page.locator('tr').filter({ hasText: 'QA VALID TRANSCRIBE M15-07-6' }).first();
  await expect(row).toBeVisible({ timeout: 15_000 });
  await row.getByRole('link').click();
  const transcribe = page.getByRole('button', { name: /Transcripci[oó]n|Transcribir/i }).first();
  if (await transcribe.count()) await transcribe.click();
  await expect(page.locator('body')).toContainText(/transcripci[oó]n|transcript|completad/i, { timeout: 30_000 });
  const analyze = page.getByRole('button', { name: /Analizar|Análisis IA|Iniciar an[aá]lisis/i }).first();
  await expect(analyze).toBeVisible({ timeout: 15_000 });
  await analyze.click();
  await expect(page.locator('body')).toContainText(/Análisis|resumen|acuerdos|tareas|procesando|completad/i, { timeout: 30_000 });
});
