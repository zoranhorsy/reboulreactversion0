#!/usr/bin/env node

/**
 * Script d'audit simplifié pour le Time to Interactive (TTI) et la performance
 * 
 * Ce script utilise Puppeteer pour mesurer les performances directement
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Configuration
const config = {
  // URLs à tester
  urls: [
    'http://localhost:3000',
    'http://localhost:3000/catalogue',
    'http://localhost:3000/produit/1',
    'http://localhost:3000/checkout'
  ],
  
  // Répertoire pour sauvegarder les rapports
  outputDir: path.join(process.cwd(), 'reports', 'performance', 'simplified')
};

// Créer le répertoire de sortie
function createOutputDir() {
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
    console.log(`✅ Répertoire créé: ${config.outputDir}`);
  }
}

// Fonction d'attente
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mesurer les performances d'une page
async function measurePagePerformance(url) {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 1280,
      height: 720
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Collecter les métriques de performance
  const client = await page.target().createCDPSession();
  await client.send('Performance.enable');
  
  // Mesurer les métriques Web Vitals
  await page.evaluateOnNewDocument(() => {
    window.performanceMetrics = {
      startTime: performance.now(),
      firstPaint: 0,
      firstContentfulPaint: 0,
      domContentLoaded: 0,
      timeToInteractive: 0,
      loaded: 0,
      longTasks: []
    };
    
    // Observer les long tasks
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      window.performanceMetrics.longTasks = [
        ...window.performanceMetrics.longTasks,
        ...entries.map(entry => ({
          startTime: entry.startTime,
          duration: entry.duration
        }))
      ];
    });
    
    try {
      observer.observe({ type: 'longtask', buffered: true });
    } catch (e) {
      console.log('LongTask API not supported');
    }
    
    // Observer les peintures
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-paint') {
          window.performanceMetrics.firstPaint = entry.startTime;
        }
        if (entry.name === 'first-contentful-paint') {
          window.performanceMetrics.firstContentfulPaint = entry.startTime;
        }
      }
    });
    
    try {
      paintObserver.observe({ type: 'paint', buffered: true });
    } catch (e) {
      console.log('Paint Timing API not supported');
    }
    
    // Mesurer quand le DOM est chargé
    document.addEventListener('DOMContentLoaded', () => {
      window.performanceMetrics.domContentLoaded = performance.now() - window.performanceMetrics.startTime;
    });
    
    // Mesurer quand la page est totalement chargée
    window.addEventListener('load', () => {
      window.performanceMetrics.loaded = performance.now() - window.performanceMetrics.startTime;
      
      // Après le chargement, continuer à monitorer pour une estimation du TTI
      setTimeout(() => {
        // Une fois que nous avons attendu un temps et qu'il n'y a pas eu de long tasks pendant 5 secondes
        // nous considérons que la page est interactive
        const lastLongTask = window.performanceMetrics.longTasks.length > 0 
          ? Math.max(...window.performanceMetrics.longTasks.map(t => t.startTime + t.duration))
          : window.performanceMetrics.domContentLoaded;
          
        window.performanceMetrics.timeToInteractive = Math.max(
          lastLongTask, 
          window.performanceMetrics.domContentLoaded
        );
      }, 5000);
    });
  });
  
  const startTime = Date.now();
  
  try {
    // Naviguer vers l'URL avec une méthode plus fiable
    console.log(`🧭 Navigation vers ${url}...`);
    
    try {
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 // Réduire le timeout à 30s
      });
    } catch (error) {
      console.warn(`⚠️ Erreur initiale de navigation: ${error.message}`);
      console.log(`🔄 Tentative avec waitUntil réduit...`);
      // Réessayer avec des options moins strictes
      await page.goto(url, { 
        waitUntil: 'load',
        timeout: 30000
      });
    }
    
    // Attendre pour capturer le TTI
    console.log(`⏳ Attente pour mesurer le TTI...`);
    await wait(8000); // Utiliser notre fonction wait personnalisée
    
    // Récupérer les métriques
    const performanceMetrics = await page.evaluate(() => window.performanceMetrics);
    const perfMetricsFromDevtools = await client.send('Performance.getMetrics');
    
    // Calculer le temps total de chargement
    const loadTime = Date.now() - startTime;
    
    // Prendre une capture d'écran
    const screenshotPath = path.join(config.outputDir, `${url.replace(/[^a-z0-9]/gi, '_')}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    
    // Récupérer les ressources chargées
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(resource => ({
        name: resource.name,
        type: resource.initiatorType,
        size: resource.transferSize,
        duration: resource.duration,
        startTime: resource.startTime
      }));
    });
    
    // Calculer la taille totale du JavaScript
    const jsResources = resources.filter(r => 
      r.type === 'script' || r.name.endsWith('.js') || r.name.includes('js?')
    );
    const totalJSSize = jsResources.reduce((sum, r) => sum + r.size, 0);
    const totalJSTime = jsResources.reduce((sum, r) => sum + r.duration, 0);
    
    return {
      url,
      loadTime,
      domContentLoaded: performanceMetrics.domContentLoaded,
      timeToInteractive: performanceMetrics.timeToInteractive,
      firstPaint: performanceMetrics.firstPaint,
      firstContentfulPaint: performanceMetrics.firstContentfulPaint,
      longTasks: performanceMetrics.longTasks || [],
      totalJSSize,
      totalJSTime,
      jsResourcesCount: jsResources.length,
      screenshotPath,
      devtoolsMetrics: perfMetricsFromDevtools,
      resources: resources.slice(0, 20) // Limiter à 20 ressources pour ne pas surcharger le rapport
    };
    
  } catch (error) {
    console.error(`❌ Erreur lors de la mesure de ${url}:`, error);
    
    // Essayer de prendre une capture d'écran même en cas d'erreur
    try {
      const errorScreenshotPath = path.join(config.outputDir, `error_${url.replace(/[^a-z0-9]/gi, '_')}.png`);
      await page.screenshot({ path: errorScreenshotPath });
      console.log(`📸 Capture d'écran d'erreur sauvegardée: ${errorScreenshotPath}`);
    } catch (screenshotError) {
      console.error(`Impossible de prendre une capture d'écran d'erreur:`, screenshotError);
    }
    
    return {
      url,
      error: error.message,
      loadTime: Date.now() - startTime
    };
  } finally {
    await browser.close();
  }
}

// Générer le rapport de performance
function generateReport(results) {
  // Créer un rapport HTML
  const reportPath = path.join(config.outputDir, 'performance-report.html');
  
  const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport de Performance Reboul</title>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; line-height: 1.5; }
      h1, h2, h3 { margin-top: 2em; }
      table { width: 100%; border-collapse: collapse; margin: 1em 0; }
      th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background-color: #f5f5f5; }
      .metric-good { color: green; }
      .metric-medium { color: orange; }
      .metric-poor { color: red; }
      .screenshot { max-width: 100%; height: auto; border: 1px solid #ddd; margin: 1em 0; }
      .recommendations { background-color: #f8f9fa; padding: 1em; border-radius: 4px; }
      .recommendations h3 { margin-top: 0; }
      .page-metrics { margin-bottom: 2em; padding-bottom: 1em; border-bottom: 1px solid #eee; }
    </style>
  </head>
  <body>
    <h1>Rapport de Performance Reboul</h1>
    <p>Date du test: ${new Date().toLocaleString()}</p>
    
    <h2>Résumé</h2>
    <table>
      <tr>
        <th>Page</th>
        <th>Temps de chargement</th>
        <th>TTI (estimé)</th>
        <th>FCP</th>
        <th>Tâches longues</th>
        <th>Taille JS</th>
      </tr>
      ${results.map(result => `
      <tr>
        <td>${result.url.replace('http://localhost:3000', '')}</td>
        <td class="${getMetricClass(result.loadTime, 3000, 5000)}">${result.loadTime ? result.loadTime.toFixed(0) + ' ms' : 'N/A'}</td>
        <td class="${getMetricClass(result.timeToInteractive, 3800, 7300)}">${result.timeToInteractive ? result.timeToInteractive.toFixed(0) + ' ms' : 'N/A'}</td>
        <td class="${getMetricClass(result.firstContentfulPaint, 1800, 3000)}">${result.firstContentfulPaint ? result.firstContentfulPaint.toFixed(0) + ' ms' : 'N/A'}</td>
        <td>${result.longTasks ? result.longTasks.length : 'N/A'}</td>
        <td>${result.totalJSSize ? (result.totalJSSize / 1024).toFixed(1) + ' KB' : 'N/A'}</td>
      </tr>
      `).join('')}
    </table>
    
    <h2>Recommandations générales</h2>
    <div class="recommendations">
      <h3>Amélioration du TTI</h3>
      <ul>
        <li>Différer le chargement des scripts non-critiques avec <code>dynamic import()</code></li>
        <li>Minimiser le code JavaScript avec une meilleure séparation des bundles</li>
        <li>Optimiser les chargements des contexts React et leur initialisation</li>
        <li>Réduire la taille du bundle JavaScript principal</li>
      </ul>
      
      <h3>Autres optimisations</h3>
      <ul>
        <li>Préchargement (preload) et preconnect des ressources critiques</li>
        <li>Optimisation et compression des images</li>
        <li>Mise en cache des ressources statiques côté client</li>
        <li>Mise en œuvre stratégique de Suspense pour améliorer le chargement progressif</li>
      </ul>
    </div>
    
    ${results.map(result => `
    <div class="page-metrics">
      <h2>Métriques pour ${result.url.replace('http://localhost:3000', '')}</h2>
      ${result.error ? `
      <p style="color: red">Erreur: ${result.error}</p>
      <table>
        <tr><th>Métrique</th><th>Valeur</th></tr>
        <tr><td>Temps de tentative</td><td>${result.loadTime ? result.loadTime.toFixed(0) + ' ms' : 'N/A'}</td></tr>
      </table>
      ` : `
      <div>
        <h3>Métriques principales</h3>
        <table>
          <tr><th>Métrique</th><th>Valeur</th><th>Évaluation</th></tr>
          <tr>
            <td>Temps de chargement total</td>
            <td>${result.loadTime.toFixed(0)} ms</td>
            <td class="${getMetricClass(result.loadTime, 3000, 5000)}">${getMetricRating(result.loadTime, 3000, 5000)}</td>
          </tr>
          <tr>
            <td>DOMContentLoaded</td>
            <td>${result.domContentLoaded ? result.domContentLoaded.toFixed(0) : 'N/A'} ms</td>
            <td class="${getMetricClass(result.domContentLoaded, 2500, 4000)}">${getMetricRating(result.domContentLoaded, 2500, 4000)}</td>
          </tr>
          <tr>
            <td>Time to Interactive (estimé)</td>
            <td>${result.timeToInteractive ? result.timeToInteractive.toFixed(0) : 'N/A'} ms</td>
            <td class="${getMetricClass(result.timeToInteractive, 3800, 7300)}">${getMetricRating(result.timeToInteractive, 3800, 7300)}</td>
          </tr>
          <tr>
            <td>First Paint</td>
            <td>${result.firstPaint ? result.firstPaint.toFixed(0) : 'N/A'} ms</td>
            <td class="${getMetricClass(result.firstPaint, 1600, 3000)}">${getMetricRating(result.firstPaint, 1600, 3000)}</td>
          </tr>
          <tr>
            <td>First Contentful Paint</td>
            <td>${result.firstContentfulPaint ? result.firstContentfulPaint.toFixed(0) : 'N/A'} ms</td>
            <td class="${getMetricClass(result.firstContentfulPaint, 1800, 3000)}">${getMetricRating(result.firstContentfulPaint, 1800, 3000)}</td>
          </tr>
          <tr>
            <td>Nombre de tâches longues</td>
            <td>${result.longTasks ? result.longTasks.length : 0}</td>
            <td class="${result.longTasks && result.longTasks.length > 10 ? 'metric-poor' : (result.longTasks && result.longTasks.length > 5) ? 'metric-medium' : 'metric-good'}">${result.longTasks && result.longTasks.length > 10 ? 'Mauvais' : (result.longTasks && result.longTasks.length > 5) ? 'Moyen' : 'Bon'}</td>
          </tr>
          <tr>
            <td>Taille totale JS</td>
            <td>${result.totalJSSize ? (result.totalJSSize / 1024).toFixed(1) : 'N/A'} KB</td>
            <td class="${getMetricClass(result.totalJSSize, 300*1024, 500*1024)}">${getMetricRating(result.totalJSSize, 300*1024, 500*1024)}</td>
          </tr>
          <tr>
            <td>Temps d'exécution JS</td>
            <td>${result.totalJSTime ? result.totalJSTime.toFixed(0) : 'N/A'} ms</td>
            <td class="${getMetricClass(result.totalJSTime, 300, 800)}">${getMetricRating(result.totalJSTime, 300, 800)}</td>
          </tr>
          <tr>
            <td>Nombre de ressources JS</td>
            <td>${result.jsResourcesCount || 'N/A'}</td>
            <td class="${result.jsResourcesCount > 15 ? 'metric-poor' : result.jsResourcesCount > 10 ? 'metric-medium' : 'metric-good'}">${result.jsResourcesCount > 15 ? 'Mauvais' : result.jsResourcesCount > 10 ? 'Moyen' : 'Bon'}</td>
          </tr>
        </table>
        
        ${result.screenshotPath ? `
        <h3>Capture d'écran</h3>
        <img src="${path.basename(result.screenshotPath)}" alt="Capture de ${result.url}" class="screenshot">
        ` : ''}
        
        ${result.longTasks && result.longTasks.length > 0 ? `
        <h3>Tâches longues (>50ms)</h3>
        <table>
          <tr>
            <th>Début (ms)</th>
            <th>Durée (ms)</th>
          </tr>
          ${result.longTasks.slice(0, 10).map(task => `
          <tr>
            <td>${task.startTime.toFixed(0)}</td>
            <td>${task.duration.toFixed(0)}</td>
          </tr>
          `).join('')}
          ${result.longTasks.length > 10 ? `<tr><td colspan="2">... et ${result.longTasks.length - 10} autres tâches</td></tr>` : ''}
        </table>
        ` : '<h3>Tâches longues</h3><p>Aucune tâche longue détectée ou données non disponibles</p>'}
        
        ${result.resources && result.resources.length > 0 ? `
        <h3>Ressources (Top 10)</h3>
        <table>
          <tr>
            <th>Type</th>
            <th>Taille</th>
            <th>Durée</th>
            <th>Nom</th>
          </tr>
          ${result.resources.slice(0, 10).map(res => `
          <tr>
            <td>${res.type}</td>
            <td>${(res.size / 1024).toFixed(1)} KB</td>
            <td>${res.duration.toFixed(0)} ms</td>
            <td>${res.name.split('/').pop()}</td>
          </tr>
          `).join('')}
        </table>
        ` : '<h3>Ressources</h3><p>Données non disponibles</p>'}
      </div>
      `}
    </div>
    `).join('')}
    
    <script>
      // JS pour le rapport si nécessaire
    </script>
  </body>
  </html>
  `;
  
  fs.writeFileSync(reportPath, htmlTemplate);
  console.log(`✅ Rapport HTML généré: ${reportPath}`);
  
  // Générer aussi un rapport JSON pour référence
  const jsonReportPath = path.join(config.outputDir, 'performance-data.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(results, null, 2));
  console.log(`✅ Données JSON générées: ${jsonReportPath}`);
  
  return { htmlPath: reportPath, jsonPath: jsonReportPath };
}

// Fonction d'aide pour évaluer les métriques
function getMetricClass(value, goodThreshold, poorThreshold) {
  if (!value) return '';
  return value <= goodThreshold 
    ? 'metric-good' 
    : value <= poorThreshold 
      ? 'metric-medium' 
      : 'metric-poor';
}

function getMetricRating(value, goodThreshold, poorThreshold) {
  if (!value) return 'N/A';
  return value <= goodThreshold 
    ? 'Bon' 
    : value <= poorThreshold 
      ? 'Moyen' 
      : 'Mauvais';
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage de l\'audit de performance simplifié...');
  
  createOutputDir();
  
  const results = [];
  
  // Tester chaque URL
  for (const url of config.urls) {
    console.log(`\n📊 Test de ${url}...`);
    
    try {
      const result = await measurePagePerformance(url);
      results.push(result);
      
      // Afficher un résumé partiel
      if (!result.error) {
        console.log(`✅ Résultats pour ${url}:`);
        console.log(`  - Temps de chargement: ${result.loadTime.toFixed(0)}ms`);
        console.log(`  - TTI estimé: ${result.timeToInteractive ? result.timeToInteractive.toFixed(0) + 'ms' : 'N/A'}`);
        console.log(`  - FCP: ${result.firstContentfulPaint ? result.firstContentfulPaint.toFixed(0) + 'ms' : 'N/A'}`);
        console.log(`  - Tâches longues: ${result.longTasks ? result.longTasks.length : 0}`);
        console.log(`  - Taille JS: ${result.totalJSSize ? (result.totalJSSize / 1024).toFixed(1) + 'KB' : 'N/A'}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'audit de ${url}:`, error);
      results.push({ url, error: error.message, loadTime: 0 });
    }
  }
  
  // Générer le rapport
  const report = generateReport(results);
  
  console.log('\n🎉 Audit terminé!');
  console.log(`📊 Consultez le rapport HTML: ${report.htmlPath}`);
  console.log(`📁 Les données brutes sont disponibles dans: ${report.jsonPath}`);
  
  // Ouvrir le rapport dans le navigateur
  try {
    console.log(`💻 Tentative d'ouverture du rapport dans le navigateur...`);
    const { default: open } = await import('open');
    await open(report.htmlPath);
    console.log(`✅ Rapport ouvert dans votre navigateur par défaut`);
  } catch (error) {
    console.log(`⚠️ Impossible d'ouvrir automatiquement le rapport: ${error.message}`);
    console.log(`📝 Ouvrez manuellement le rapport à l'adresse: ${report.htmlPath}`);
  }
}

main().catch(error => {
  console.error('Erreur:', error);
  process.exit(1);
}); 