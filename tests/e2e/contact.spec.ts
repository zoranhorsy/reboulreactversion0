import { test, expect } from '@playwright/test';

test.describe('Formulaire de contact', () => {
  test('envoie un message de contact et affiche le toast de succès', async ({ page }) => {
    await page.goto('http://localhost:3000/contact');
    await page.fill('input#name', 'Jean Testeur');
    await page.fill('input#email', 'jean.testeur@example.com');
    await page.fill('textarea#message', 'Ceci est un message de test E2E.');
    await page.click('button[type=submit]');
    // Vérifie le toast de succès
    await expect(page.getByText('Message envoyé')).toBeVisible();
    // Vérifie le reset des champs
    await expect(page.locator('input#name')).toHaveValue('');
    await expect(page.locator('input#email')).toHaveValue('');
    await expect(page.locator('textarea#message')).toHaveValue('');
  });
}); 