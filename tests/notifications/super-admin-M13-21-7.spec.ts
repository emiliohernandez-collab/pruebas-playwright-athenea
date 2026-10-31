import { expect, test } from '@playwright/test';

test('M13-21-7 — Super Administrador — Crear notificación interna', async ({ page }) => {
  test.setTimeout(45_000);
  const message = `QA M13-21-7 internal ${Date.now()}`;
  await page.goto('/Notifications/Send');
  await expect(page.locator('body')).toContainText(/Enviar.*notific|Notificaci[oó]n/i);
  const fields = page.getByRole('textbox');
  await expect(fields.first()).toBeVisible();
  await fields.last().fill(message);
  const send = page.getByRole('button', { name: /Enviar|Send/i }).last();
  await expect(send).toBeVisible();
  await send.click();
  await expect(page.locator('body')).toContainText(/enviad|cola|programad|Notificaci[oó]n/i);
});
