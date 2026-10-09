import { expect, Page } from '@playwright/test';

export class OrganizationSwitcherPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.getByRole('button', { name: /QA Checkout Stripe/i }).click();
  }

  async switchTo(name: string): Promise<void> {
    await this.page.getByRole('link', { name: new RegExp(name, 'i') }).click();
    await expect(this.page.getByRole('button', { name: new RegExp(name, 'i') })).toBeVisible();
  }
}
