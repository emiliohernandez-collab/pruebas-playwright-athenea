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

  async openFiles(): Promise<void> {
    await this.page.getByRole('tab', { name: /Archivos/i }).click();
    await expect(this.page.getByRole('heading', { name: /Proyecto Archivos/i })).toBeVisible({ timeout: 15_000 });
  }

  async uploadProjectFile(filePath: string, fileName: string): Promise<void> {
    await this.page.getByRole('button', { name: /Subir Archivo/i }).click();
    const input = this.page.locator('input[type="file"]').first();
    await input.setInputFiles(filePath);
    await expect(this.page.locator('body')).toContainText(fileName, { timeout: 20_000 });
  }

  async editLatestFile(fileName: string, description: string): Promise<void> {
    await this.page.locator('.swal2-popup').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => undefined);
    const row = this.page.locator('.pf-file-row').filter({ hasText: fileName }).last();
    await expect(row).toBeVisible({ timeout: 20_000 });
    await row.locator('button').first().click();
    const modal = this.page.locator('.swal2-popup').last();
    await expect(modal).toBeVisible({ timeout: 10_000 });
    const descriptionField = modal.locator('input.swal2-input');
    await descriptionField.fill(description);
    await modal.getByRole('button', { name: /^OK$/i }).click();
    await expect(this.page.locator('body')).toContainText(description, { timeout: 20_000 });
  }

  async deleteLatestFile(fileName: string): Promise<void> {
    await this.page.locator('.swal2-popup').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => undefined);
    const rows = this.page.locator('.pf-file-row').filter({ hasText: fileName });
    const before = await rows.count();
    const row = rows.last();
    await expect(row).toBeVisible({ timeout: 20_000 });
    await row.locator('button').last().click();
    const modal = this.page.locator('.swal2-popup').last();
    await expect(modal).toBeVisible({ timeout: 10_000 });
    await modal.getByRole('button', { name: /^Eliminar$/i }).click();
    await expect(this.page.locator('.pf-file-row').filter({ hasText: fileName })).toHaveCount(before - 1, { timeout: 20_000 });
  }
}
