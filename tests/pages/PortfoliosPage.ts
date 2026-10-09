import { expect, Page } from '@playwright/test';

export class PortfoliosPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/Portfolios/Index', { waitUntil: 'commit', timeout: 20_000 });
    await expect(this.page).toHaveURL(/Portfolios\/Index/i);
    await expect(this.page.getByRole('heading', { name: /Portafolios/i })).toBeVisible({ timeout: 20_000 });
  }

  async createPortfolio(name: string): Promise<void> {
    await this.page.getByRole('button', { name: /Crear Portafolio/i }).click();
    await expect(this.page.getByRole('heading', { name: /Crear Portafolio/i })).toBeVisible({ timeout: 15_000 });
    await this.page.getByPlaceholder('Nombre del portafolio').fill(name);
    await this.page.getByRole('button', { name: /^.*Crear$/i }).last().click();
    await expect(this.page.getByRole('heading', { name, exact: true })).toBeVisible({ timeout: 20_000 });
    await this.open();
    await expect(this.page.getByRole('heading', { name, exact: true })).toBeVisible({ timeout: 20_000 });
  }

  async openFirstPortfolio(): Promise<string> {
    const card = this.page.locator('.portfolio-card').first();
    await expect(card).toBeVisible({ timeout: 20_000 });
    const title = card.locator('.portfolio-card-title').first();
    await expect(title).toBeVisible();
    const name = (await title.textContent())?.trim();
    if (!name) throw new Error('El primer portafolio no tiene nombre visible');
    await expect(card).toBeVisible();
    await card.click();
    return name;
  }

  async renameFirstPortfolio(newName: string): Promise<string> {
    const card = this.page.locator('.portfolio-card').first();
    const title = card.locator('.portfolio-card-title').first();
    const oldName = (await title.textContent())?.trim();
    if (!oldName) throw new Error('El portafolio seleccionado no tiene nombre visible');
    await card.getByRole('button', { name: /Editar/i }).click();
    await expect(this.page.getByRole('heading', { name: /Editar Portafolio/i })).toBeVisible({ timeout: 15_000 });
    await this.page.getByPlaceholder('Nombre del portafolio').fill(newName);
    await this.page.getByRole('button', { name: /Actualizar/i }).click();
    await expect(this.page).toHaveURL(/Portfolios\/Details\//i, { timeout: 20_000 });
    await expect(this.page.getByRole('heading', { name: newName, exact: true })).toBeVisible({ timeout: 20_000 });
    await this.open();
    await expect(this.page.getByRole('heading', { name: newName, exact: true })).toBeVisible({ timeout: 20_000 });
    return oldName;
  }
}
