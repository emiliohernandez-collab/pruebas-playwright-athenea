import { expect, Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto(process.env.ATHENEA_LOGIN_PATH ?? '/Account/Login', { waitUntil: 'commit', timeout: 20_000 });
    await this.page.locator('#Email').waitFor({ state: 'visible', timeout: 20_000 });
  }

  async signIn(username: string, password: string): Promise<void> {
    const email = this.page.locator('#Email');
    const passwordInput = this.page.locator('#Password');

    await email.fill(username);
    await passwordInput.fill(password);
    await this.page.getByRole('button', { name: /iniciar sesión|entrar|login/i, exact: true }).click();
  }

  async expectAuthenticated(): Promise<void> {
    const invalidCredentials = this.page.getByText(/invalid credentials|credenciales inválidas/i);
    if (await invalidCredentials.isVisible().catch(() => false)) {
      throw new Error('El ambiente rechazó las credenciales configuradas en ATHENEA_USER/ATHENEA_PASSWORD.');
    }
    await expect(this.page).toHaveURL(/Dashboard/i);
  }
}
