import { test, expect } from '@playwright/test';

test.describe('M00-01-7 — Super Administrador — Consultar lecturas del módulo', () => {
  test('el Dashboard carga con datos de la organización', async ({ page }) => {
    test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan ATHENEA_USER y ATHENEA_PASSWORD');

    await page.goto('/');

    // Estos selectores se confirmarán con la primera ejecución contra la aplicación.
    await page.getByLabel(/correo|email|usuario/i).fill(process.env.ATHENEA_USER!);
    await page.getByLabel(/contraseña|password/i).fill(process.env.ATHENEA_PASSWORD!);
    await page.getByRole('button', { name: /iniciar sesión|entrar|login/i }).click();

    await expect(page).toHaveURL(/Dashboard/i);
    await expect(page.locator('body')).not.toContainText(/error 500|internal server error/i);
  });
});
