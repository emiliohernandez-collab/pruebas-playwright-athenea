import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

/**
 * Verifica el extremo receptor del flujo Email a Ticket.
 *
 * El envío del correo se realiza fuera de Playwright (SMTP/Gmail) para no
 * guardar credenciales de correo en el repositorio. La prueba recibe el
 * asunto enviado por EMAIL_TEST_SUBJECT y espera el máximo del intervalo IMAP
 * configurado más un margen corto.
 */
test('M07-02-7 — Administrador Organización — Crear ticket desde correo recibido', async ({ page }) => {
  test.skip(
    !process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD || !process.env.EMAIL_TEST_SUBJECT,
    'Faltan ATHENEA_USER, ATHENEA_PASSWORD o EMAIL_TEST_SUBJECT',
  );

  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  const subject = process.env.EMAIL_TEST_SUBJECT!;
  const pollMinutes = Number(process.env.EMAIL_POLL_MINUTES ?? '5');

  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();

  await page.goto('/Tickets/Index', { waitUntil: 'domcontentloaded' });
  const search = page.locator('#searchInput');
  await expect(search).toBeVisible();
  await expect.poll(
    async () => {
      await search.fill(subject);
      await page.waitForTimeout(500);
      return await page.locator('body').textContent();
    },
    { timeout: (pollMinutes + 1) * 60_000, intervals: [5_000, 10_000, 20_000] },
  ).toContain(subject);

  const row = page.locator('tr').filter({ hasText: subject }).first();
  await expect(row).toContainText(/Nuevo|Asignado|En Progreso|Esperando Cliente|Resuelto|Cerrado/i);
  await expect(row).toContainText(/Media|Alta|Urgente|Baja/i);
});
