import { expect, Page } from '@playwright/test';

export class ProjectsPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/Projects/Index', { waitUntil: 'commit', timeout: 20_000 });
    await expect(this.page).toHaveURL(/Projects\/Index/i);
    await expect(this.page.getByRole('heading', { name: /Proyectos/i })).toBeVisible({ timeout: 20_000 });
    await expect(this.page.getByText(/Total Proyectos/i)).toBeVisible();
  }

  async openFirstProject(): Promise<string> {
    const card = this.page.locator('.project-card').first();
    await expect(card).toBeVisible({ timeout: 20_000 });
    const title = card.locator('.project-card-title').first();
    await expect(title).toBeVisible({ timeout: 20_000 });
    const name = (await title.textContent())?.trim();
    if (!name) throw new Error('El primer proyecto no tiene nombre visible');
    await card.click();
    await expect(this.page).toHaveURL(/Projects\/Details\//i, { timeout: 20_000 });
    await expect(this.page.getByRole('heading', { level: 3, name, exact: true })).toBeVisible({ timeout: 20_000 });
    return name;
  }

  async expectDetailTabs(): Promise<void> {
    for (const tabName of ['Resumen', 'Lista', 'Tablero', 'Gantt', 'Notas', 'Archivos', 'Calendario', 'Metas', 'Hitos', 'Actividad']) {
      await expect(this.page.getByRole('tab', { name: new RegExp(tabName, 'i') })).toBeVisible();
    }
  }
}
