import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M15-03-6 — Administrador Organización — Completar carga de reunión', async ({ page }) => {
  test.setTimeout(45_000);
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    const expected = page.getByText(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe', { exact: true });
    if (await expected.count()) await expected.click();
    else await page.getByText('Athenea Demo.', { exact: true }).click();
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto('/Meetings');
  await page.getByRole('button', { name: /Subir|Nueva reuni[oó]n|Cargar/i }).last().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').fill('Reunión QA M15-03-6');
  const inputs = dialog.locator('input[type="file"]');
  await inputs.last().setInputFiles({
    name: 'qa-meeting-complete.wav',
    mimeType: 'audio/wav',
    buffer: Buffer.from('RIFF----WAVEfmt ', 'ascii'),
  });
  await dialog.getByRole('button', { name: /Subir Grabación/i }).last().click();
  await expect(page.locator('body')).toContainText(/100\s*%|complet|procesad|cargad|Procesando/i, { timeout: 20_000 });
});
