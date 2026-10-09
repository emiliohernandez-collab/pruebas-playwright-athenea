import { expect, Page } from '@playwright/test';

export class OrganizationSwitcherPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    const selector = this.page.getByRole('button', { name: /QA Checkout Stripe/i });
    await selector.focus();
    await selector.press('Enter');
    await expect(selector).toHaveAttribute('aria-expanded', 'true', { timeout: 5_000 });
    await expect(this.page.getByText('Mis Organizaciones', { exact: true })).toBeVisible({ timeout: 15_000 });
  }

  async switchTo(name: string): Promise<void> {
    await this.page.getByText(name, { exact: true }).click();
    await expect(this.page.getByText(/Organización cambiada/i)).toBeVisible({ timeout: 20_000 });
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible({ timeout: 20_000 });
  }
}
