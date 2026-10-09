import { expect, Page } from '@playwright/test';

export class OrganizationSwitcherPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.locator('button').filter({ hasText: 'QA Checkout Stripe' }).click();
    await expect(this.page.getByRole('link', { name: /Ribbit/i })).toBeVisible({ timeout: 15_000 });
  }

  async switchTo(name: string): Promise<void> {
    await this.page.getByRole('link', { name: new RegExp(name, 'i') }).click();
    await expect(this.page.getByRole('button', { name: new RegExp(name, 'i') })).toBeVisible();
  }
}
