import { expect, Page } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async expectLoaded(): Promise<void> {
    await expect(this.page.locator('body')).not.toContainText(/error 500|internal server error/i);
    await expect(this.page.locator('body')).toContainText(/dashboard|organización|lecturas/i);
  }
}
