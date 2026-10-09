import { expect, Page } from '@playwright/test';

export class PasswordPage {
  constructor(private readonly page: Page) {}

  async openDialog(): Promise<void> {
    await this.page.getByRole('button', { name: /Cambiar Contraseña/i }).click();
    await expect(this.page.getByRole('dialog', { name: /Cambiar Contraseña/i })).toBeVisible();
  }

  async change(currentPassword: string, newPassword: string): Promise<void> {
    const dialog = this.page.getByRole('dialog', { name: /Cambiar Contraseña/i });
    await dialog.locator('#currentPassword').fill(currentPassword);
    await dialog.locator('#newPassword').fill(newPassword);
    await dialog.locator('#confirmPassword').fill(newPassword);
    await dialog.getByRole('button', { name: /Cambiar Contraseña/i }).click();
    await this.page.waitForTimeout(1_500);
  }
}
