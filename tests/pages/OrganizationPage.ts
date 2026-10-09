import { expect, Page } from '@playwright/test';

export class OrganizationPage {
  constructor(private readonly page: Page) {}

  async select(name: string): Promise<void> {
    const option = this.page.getByText(name, { exact: true });
    await expect(option).toBeVisible({ timeout: 30_000 });
    await option.click();
  }

  async continue(): Promise<void> {
    await this.page.getByRole('button', { name: /continuar/i, exact: true }).click();
  }
}
