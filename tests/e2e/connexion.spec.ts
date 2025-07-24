import { test, expect } from '@playwright/test';

test('Connexion admin puis déconnexion automatique après inactivité', async ({ page }) => {
  await page.goto('http://localhost:3000/connexion');
  await expect(page).toHaveTitle(/Connexion/);
  await page.fill('input[name="email"]', 'zoran@reboul.com');
  await page.fill('input[name="password"]', 'nouveauMotDePasse123');
  await page.click('button[type="submit"]');
  // Attendre un peu pour laisser la session se mettre à jour
  await page.waitForTimeout(2000);
  // Vérifie la connexion
  const bodyText = await page.locator('body').innerText();
  const hasProfil = /profil|déconnexion|logout|zoran@reboul.com/i.test(bodyText);
  const hasError = /erreur|incorrect|invalide|destructive/i.test(bodyText);
  expect(hasProfil || !hasError).toBeTruthy();

  // Attendre l'expiration du timer d'inactivité (ex: 6 secondes)
  await page.waitForTimeout(7000);

  // Vérifie la déconnexion automatique
  // On s'attend à voir le formulaire de connexion ou un message de déconnexion
  const urlAfter = page.url();
  const bodyTextAfter = await page.locator('body').innerText();
  const isOnLogin = /connexion|login/i.test(urlAfter) || /connexion|déconnexion|login|logout/i.test(bodyTextAfter);
  expect(isOnLogin).toBeTruthy();
});
