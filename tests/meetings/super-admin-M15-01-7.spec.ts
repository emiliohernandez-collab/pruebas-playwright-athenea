import { expect, test } from '@playwright/test';

test('M15-01-7 — Super Administrador — Consultar reuniones', async ({ page }) => {
  test.setTimeout(45_000);
  await page.goto('/Meetings');
  await expect(page.locator('body')).toContainText(/Reuniones|Meetings|Subir/i);
  await expect(page.locator('body')).toContainText(/Nueva|Subir|reuni[oó]n|No hay/i);
});
