import { expect, test } from '@playwright/test';

test('M13-13-7 — Super Administrador — Cancelar notificación en cola', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/Notifications/Send');
  await page.locator('#subject').fill(`QA M13-13-7 ${Date.now()}`);
  await page.locator('#body').fill('Prueba de cancelación en cola');
  await page.locator('#recipients').fill('emilyhdzp@gmail.com');
  await page.locator('#btnSend').click();
  await expect(page.getByText('Notificación enviada a la cola correctamente')).toBeVisible();
  await expect(page.getByRole('button', { name: /Cancelar/i }).first()).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /Cancelar/i }).first().click();
  await page.waitForTimeout(2_000);
  await page.reload();
  await expect(page.locator('body')).toContainText(/Canceled|Cancelada/i);
});
