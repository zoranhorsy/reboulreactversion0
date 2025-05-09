/**
 * Script de lancement des audits Lighthouse pour le projet Reboul
 * 
 * Usage: node run-audit.js [method]
 * method: 'chrome-launcher' (par défaut) ou 'puppeteer'
 */

const { execSync } = require('child_process');
const path = require('path');

// Récupérer la méthode depuis les arguments
const args = process.argv.slice(2);
const method = args[0] || 'chrome-launcher';

// Déterminer le script à exécuter
let scriptPath;
if (method === 'puppeteer') {
  scriptPath = path.join(__dirname, 'lighthouse-puppeteer.js');
  console.log('🔍 Lancement de l\'audit avec la méthode Puppeteer...');
} else {
  scriptPath = path.join(__dirname, 'lighthouse-audit.js');
  console.log('🔍 Lancement de l\'audit avec la méthode Chrome Launcher...');
}

// Vérifier que l'application est en cours d'exécution
console.log('⚠️ Assurez-vous que votre application Next.js est en cours d\'exécution sur http://localhost:3000');
console.log('⏳ Démarrage de l\'audit dans 3 secondes...');

// Attendre 3 secondes
setTimeout(() => {
  try {
    // Exécuter le script d'audit
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution de l\'audit:', error.message);
    process.exit(1);
  }
}, 3000); 