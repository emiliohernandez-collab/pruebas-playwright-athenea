import { expect, Page } from '@playwright/test';

export class MyDataPage {
  constructor(private readonly page: Page) {}

  async openFromUserMenu(): Promise<void> {
    await this.page.getByRole('button', { name: /QA Admin Super Sistema/i }).click();
    await this.page.getByRole('link', { name: /Mi Cuenta/i }).click();
    await expect(this.page).toHaveURL(/Account\/MyData/i);
    await this.page.getByPlaceholder('Nombre').waitFor({ state: 'visible' });
  }

  async values(): Promise<{ firstName: string; lastName: string; phone: string }> {
    return {
      firstName: await this.page.getByPlaceholder('Nombre').inputValue(),
      lastName: await this.page.getByPlaceholder('Primer apellido').inputValue(),
      phone: await this.page.getByPlaceholder('(55) 1234-5678').inputValue(),
    };
  }

  async fill(firstName: string, lastName: string, phone: string): Promise<void> {
    await this.page.getByPlaceholder('Nombre').fill(firstName);
    await this.page.getByPlaceholder('Primer apellido').fill(lastName);
    await this.page.getByPlaceholder('(55) 1234-5678').fill(phone);
  }

  async save(): Promise<void> {
    await this.page.getByRole('button', { name: /guardar cambios/i }).first().click();
    await expect(this.page.locator('body')).toContainText(/guardad|actualizad|éxito|success/i, { timeout: 15_000 });
  }
}
