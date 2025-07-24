import { test, expect } from '@playwright/test';

test('Inscription, connexion et mot de passe oublié', async ({ page }) => {
  // Générer un email unique pour le test
  const email = `testuser+${Date.now()}@reboul.com`;
  const password = 'Test1234!';
  const username = `TestUser${Date.now()}`;

  // 1. Inscription
  await page.goto('http://localhost:3000/inscription');
  await page.fill('#name', username);
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.fill('#confirmPassword', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);
  const bodyText1 = await page.locator('body').innerText();
  expect(/inscription|compte|connectez-vous|connexion|réussie/i.test(bodyText1)).toBeTruthy();

  // 2. Connexion
  await page.goto('http://localhost:3000/connexion');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  const bodyText2 = await page.locator('body').innerText();
  console.log('BODY APRES CONNEXION:', bodyText2);
  expect(/connexion réussie|bienvenue sur reboul/i.test(bodyText2)).toBeTruthy();

  // 3. Mot de passe oublié
  await page.goto('http://localhost:3000/mot-de-passe-oublie');
  await page.fill('#email', email);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);
  const bodyText3 = await page.locator('body').innerText();
  expect(/email|envoyé|réinitialisation|mot de passe/i.test(bodyText3)).toBeTruthy();
}); 