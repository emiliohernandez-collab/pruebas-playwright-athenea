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
    await modal.getByRole('button', { name: /Sí, eliminar/i }).click();
    await expect(this.page.locator('.pf-file-row').filter({ hasText: fileName })).toHaveCount(before - 1, { timeout: 20_000 });
  }

  async createGoal(title: string, description: string): Promise<void> {
    await this.page.getByRole('tab', { name: /Metas/i }).click();
    await expect(this.page.getByRole('button', { name: /Nueva meta/i })).toBeVisible({ timeout: 15_000 });
    await this.page.getByRole('button', { name: /Nueva meta/i }).click();
    const modal = this.page.locator('#newGoalModal');
    await expect(modal).toBeVisible({ timeout: 10_000 });
    await modal.locator('#goalTitle').fill(title);
    await modal.locator('#goalDescription').fill(description);
    await modal.locator('#goalTargetDate').fill('2026-12-31');
    await modal.getByRole('button', { name: /Crear meta/i }).click();
    await expect(this.page.locator('body')).toContainText(title, { timeout: 20_000 });
    await expect(this.page.locator('body')).toContainText(description, { timeout: 20_000 });
  }

  async editLatestGoal(title: string, newDescription: string): Promise<void> {
    const titleText = this.page.getByText(title, { exact: true });
    await expect(titleText).toBeVisible({ timeout: 20_000 });
    const container = titleText.locator('xpath=ancestor::*[.//button][1]');
    await container.locator('button').first().click();
    const modal = this.page.locator('.modal.show').last();
    await expect(modal).toBeVisible({ timeout: 10_000 });
    await modal.locator('textarea').fill(newDescription);
    await modal.getByRole('button', { name: /Guardar|Actualizar/i }).click();
    await expect(this.page.locator('body')).toContainText(newDescription, { timeout: 20_000 });
    await this.page.reload();
    await this.page.getByRole('tab', { name: /Metas/i }).click();
    await expect(this.page.locator('body')).toContainText(newDescription, { timeout: 20_000 });
  }

  async completeGoal(title: string): Promise<void> {
    const titleText = this.page.getByText(title, { exact: true });
    await expect(titleText).toBeVisible({ timeout: 20_000 });
    const container = titleText.locator('xpath=ancestor::*[.//input[@type="checkbox"]][1]');
    const checkbox = container.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await expect(container).toHaveClass(/bg-light/, { timeout: 20_000 });
  }

  async reopenGoal(title: string): Promise<void> {
    const titleText = this.page.getByText(title, { exact: true });
    const container = titleText.locator('xpath=ancestor::*[.//input[@type="checkbox"]][1]');
    const checkbox = container.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
    await expect(container).not.toHaveClass(/bg-light/, { timeout: 20_000 });
  }

  async deleteGoal(title: string): Promise<void> {
    const titleText = this.page.getByText(title, { exact: true });
    const container = titleText.locator('xpath=ancestor::*[.//input[@type="checkbox"]][1]');
    await expect(container).toBeVisible({ timeout: 20_000 });
    await container.locator('button').last().click();
    const modal = this.page.locator('.swal2-popup').last();
    await expect(modal).toBeVisible({ timeout: 10_000 });
    await modal.getByRole('button', { name: /Sí, eliminar/i }).click();
    await expect(this.page.getByText(title, { exact: true })).toHaveCount(0, { timeout: 20_000 });
  }

  async createMilestone(title: string): Promise<void> {
    await this.page.getByRole('tab', { name: /Hitos/i }).click();
    await expect(this.page.getByRole('button', { name: /Nuevo hito/i })).toBeVisible({ timeout: 15_000 });
    await this.page.getByRole('button', { name: /Nuevo hito/i }).click();
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    const fields = dialog.getByRole('textbox');
    await fields.nth(0).fill(title);
    await fields.nth(1).fill('Hito temporal creado por automatización QA');
    await fields.nth(2).fill('2026-12-31');
    await dialog.getByRole('button', { name: /Crear hito/i }).click();
    await expect(this.page.getByText(title, { exact: true })).toBeVisible({ timeout: 20_000 });
    await expect(this.page.locator('body')).toContainText('31/12/2026', { timeout: 20_000 });
  }
}
