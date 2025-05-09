#!/usr/bin/env node
/**
 * Script pour ouvrir les tests des workers dans le navigateur
 * Utilisation: node scripts/open-worker-tests.js
 */

// Import correct du module open
const { default: openBrowser } = require('open');
const { spawn } = require('child_process');
const chalk = require('chalk') || { 
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`
};

// URL des tests
const TEST_URL = 'http://localhost:3000/tests/workers.html';

// Vérifier si le serveur Next.js est déjà en cours d'exécution
function checkServerRunning() {
  return new Promise((resolve) => {
    const http = require('http');
    const req = http.get('http://localhost:3000/api/health', (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log(chalk.blue('🧪 Préparation des tests des Web Workers...'));
  
  // Vérifier si le serveur est déjà en cours d'exécution
  const serverRunning = await checkServerRunning();
  
  if (serverRunning) {
    console.log(chalk.green('✅ Serveur Next.js déjà en cours d\'exécution'));
    console.log(chalk.blue(`🚀 Ouverture des tests dans le navigateur: ${TEST_URL}`));
    try {
      await openBrowser(TEST_URL);
    } catch (error) {
      console.log(chalk.yellow(`⚠️ Impossible d'ouvrir automatiquement le navigateur. Veuillez ouvrir manuellement: ${TEST_URL}`));
    }
  } else {
    console.log(chalk.yellow('⚠️ Serveur Next.js non détecté. Démarrage du serveur...'));
    
    // Compiler les workers
    console.log(chalk.blue('🔨 Compilation des Web Workers...'));
    require('./build-workers');
    
    // Démarrer le serveur Next.js
    console.log(chalk.blue('🚀 Démarrage du serveur Next.js...'));
    const server = spawn('npm', ['run', 'dev'], { 
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });
    
    let started = false;
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      
      // Détecter quand le serveur est prêt
      if (!started && (output.includes('ready') || output.includes('localhost'))) {
        started = true;
        console.log(chalk.green('✅ Serveur Next.js démarré avec succès'));
        console.log(chalk.blue(`🚀 Ouverture des tests dans le navigateur: ${TEST_URL}`));
        
        // Attendre un peu pour être sûr que le serveur est bien démarré
        setTimeout(async () => {
          try {
            await openBrowser(TEST_URL);
          } catch (error) {
            console.log(chalk.yellow(`⚠️ Impossible d'ouvrir automatiquement le navigateur. Veuillez ouvrir manuellement: ${TEST_URL}`));
          }
        }, 2000);
      }
    });
    
    server.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    server.on('close', (code) => {
      if (code !== 0) {
        console.error(chalk.red(`❌ Le serveur s'est arrêté avec le code ${code}`));
      }
    });
    
    // Gérer Ctrl+C pour arrêter proprement le serveur
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n👋 Arrêt du serveur et sortie...'));
      server.kill();
      process.exit(0);
    });
  }
}

main().catch((error) => {
  console.error('❌ Erreur:', error);
  process.exit(1);
}); 