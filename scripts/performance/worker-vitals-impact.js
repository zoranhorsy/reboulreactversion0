/**
 * Script de mesure de l'impact des Web Workers sur les Web Vitals
 * 
 * Ce script permet de comparer les performances avec et sans Web Workers
 * en exécutant une série de tests et en enregistrant les métriques Web Vitals.
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Pages à tester
const TEST_PAGES = [
  { name: 'Catalogue', path: '/catalogue', useWorkers: true },
  { name: 'Catalogue sans workers', path: '/catalogue?disableWorkers=true', useWorkers: false },
  { name: 'Produit', path: '/product/123', useWorkers: true },
  { name: 'Produit sans workers', path: '/product/123?disableWorkers=true', useWorkers: false },
  { name: 'Panier', path: '/cart', useWorkers: true },
  { name: 'Panier sans workers', path: '/cart?disableWorkers=true', useWorkers: false }
];

// URLs de base pour les tests
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://reboul.example.com' 
  : 'http://localhost:3000';

// Nombre d'exécutions par test
const TEST_RUNS = 5;

// Métriques à mesurer
const METRICS = ['LCP', 'FID', 'CLS', 'INP', 'TTFB', 'TTI', 'TBT'];

/**
 * Fonction principale d'exécution des tests
 */
async function runTests() {
  console.log('🔍 Démarrage des tests d\'impact des Web Workers sur les Web Vitals');
  console.log(`📊 Exécution de ${TEST_RUNS} tests par page`);
  
  const results = {
    timestamp: new Date().toISOString(),
    summary: {},
    detailedResults: []
  };
  
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    for (const page of TEST_PAGES) {
      console.log(`\n🌐 Test de la page: ${page.name} (${page.useWorkers ? 'avec' : 'sans'} workers)`);
      const pageResults = [];
      
      for (let run = 1; run <= TEST_RUNS; run++) {
        console.log(`  ↳ Exécution ${run}/${TEST_RUNS}`);
        const metrics = await measurePagePerformance(browser, page.path);
        pageResults.push(metrics);
        
        // Attendre un peu entre chaque test pour éviter de surcharger le système
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Calculer les moyennes pour chaque métrique
      const averages = calculateAverages(pageResults);
      console.log('  📈 Résultats moyens:');
      METRICS.forEach(metric => {
        console.log(`    ${metric}: ${averages[metric].toFixed(2)}${metric === 'CLS' ? '' : 'ms'}`);
      });
      
      results.detailedResults.push({
        page: page.name,
        path: page.path,
        useWorkers: page.useWorkers,
        runs: pageResults,
        averages
      });
    }
    
    // Comparer les résultats avec et sans workers
    results.summary = compareResults(results.detailedResults);
    
    // Enregistrer les résultats
    await saveResults(results);
    
    console.log('\n✅ Tests terminés avec succès');
    console.log(`📁 Résultats enregistrés dans: ${getResultsFilePath()}`);
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    await browser.close();
  }
}

/**
 * Mesure les performances d'une page
 * @param {Browser} browser Instance du navigateur Puppeteer
 * @param {string} pagePath Chemin de la page à tester
 * @returns {Promise<Object>} Métriques de performance mesurées
 */
async function measurePagePerformance(browser, pagePath) {
  const url = `${BASE_URL}${pagePath}`;
  const page = await browser.newPage();
  
  // Activer la collecte des métriques de performance
  await page.evaluateOnNewDocument(() => {
    window.perfMetrics = {};
    window.collectPerformanceMetrics = true;
  });
  
  try {
    // Aller sur la page et attendre le chargement complet
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Simuler des interactions utilisateur pour déclencher les métriques comme FID/INP
    await simulateUserInteraction(page);
    
    // Récupérer les métriques via le Performance API
    return await page.evaluate(() => {
      return new Promise(resolve => {
        // Fonction pour récupérer les entrées LCP
        const getLCP = () => {
          const entries = performance.getEntriesByType('largest-contentful-paint');
          return entries.length ? entries[entries.length - 1].startTime : 0;
        };
        
        // Fonction pour calculer le CLS
        const getCLS = () => {
          let cls = 0;
          new PerformanceObserver(entryList => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                cls += entry.value;
              }
            }
          }).observe({ type: 'layout-shift', buffered: true });
          return cls;
        };
        
        // Récupérer les autres métriques
        const navEntry = performance.getEntriesByType('navigation')[0];
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0;
        const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
        
        // Mesurer le Time to Interactive (approximation)
        const getTTI = () => {
          const fcp = firstContentfulPaint;
          // Trouver une période de calme du thread principal après le FCP
          // (Approximation simplifiée pour ce test)
          return fcp + 500; // Ajout d'un délai pour simplifier
        };
        
        // Mesurer le Total Blocking Time (approximation)
        const getTBT = () => {
          let tbt = 0;
          if (window.performance.getEntriesByType('longtask')) {
            const longTasks = window.performance.getEntriesByType('longtask');
            for (const task of longTasks) {
              // Temps de blocage = durée - 50ms (seuil de tâche longue)
              const blockingTime = task.duration - 50;
              if (blockingTime > 0) {
                tbt += blockingTime;
              }
            }
          }
          return tbt;
        };
        
        // Collecter toutes les métriques
        setTimeout(() => {
          resolve({
            LCP: getLCP(),
            FID: window.perfMetrics.fid || 0,
            CLS: getCLS(),
            INP: window.perfMetrics.inp || 0,
            TTFB: navEntry ? navEntry.responseStart : 0,
            FCP: firstContentfulPaint,
            TTI: getTTI(),
            TBT: getTBT(),
            timestamp: Date.now()
          });
        }, 5000); // Attendre que les métriques soient disponibles
      });
    });
  } finally {
    await page.close();
  }
}

/**
 * Simule des interactions utilisateur sur la page
 * @param {Page} page Instance de page Puppeteer
 */
async function simulateUserInteraction(page) {
  try {
    // Faire défiler la page
    await page.evaluate(() => {
      window.scrollBy(0, 200);
      setTimeout(() => window.scrollBy(0, 400), 300);
      setTimeout(() => window.scrollBy(0, -200), 600);
    });
    
    // Attendre que le défilement soit terminé
    await page.waitForTimeout(1000);
    
    // Cliquer sur des éléments interactifs (si disponibles)
    const interactiveElements = await page.$$('button, a, select, input');
    if (interactiveElements.length > 0) {
      // Cliquer sur le premier élément interactif trouvé
      await interactiveElements[0].click().catch(() => {});
    }
    
    // Attendre que les interactions soient traitées
    await page.waitForTimeout(1000);
  } catch (error) {
    console.warn('Avertissement: Impossible de simuler l\'interaction:', error.message);
  }
}

/**
 * Calcule les moyennes pour chaque métrique
 * @param {Array<Object>} pageResults Résultats de tous les tests pour une page
 * @returns {Object} Moyennes pour chaque métrique
 */
function calculateAverages(pageResults) {
  const averages = {};
  
  METRICS.forEach(metric => {
    const sum = pageResults.reduce((acc, result) => acc + (result[metric] || 0), 0);
    averages[metric] = sum / pageResults.length;
  });
  
  return averages;
}

/**
 * Compare les résultats avec et sans workers
 * @param {Array<Object>} results Résultats détaillés
 * @returns {Object} Résumé de la comparaison
 */
function compareResults(results) {
  const summary = {
    improvements: {},
    totalImprovements: {}
  };
  
  // Regrouper les pages par paires (avec/sans workers)
  const pages = Array.from(new Set(results.map(r => r.page.replace(' sans workers', ''))));
  
  pages.forEach(pageName => {
    const withWorkers = results.find(r => r.page === pageName);
    const withoutWorkers = results.find(r => r.page === `${pageName} sans workers`);
    
    if (withWorkers && withoutWorkers) {
      summary.improvements[pageName] = {};
      
      METRICS.forEach(metric => {
        const withValue = withWorkers.averages[metric];
        const withoutValue = withoutWorkers.averages[metric];
        
        // Calculer l'amélioration en pourcentage (valeurs plus basses sont meilleures)
        const improvement = ((withoutValue - withValue) / withoutValue) * 100;
        
        summary.improvements[pageName][metric] = {
          withWorkers: withValue,
          withoutWorkers: withoutValue,
          difference: withoutValue - withValue,
          percentImprovement: improvement
        };
        
        // Ajouter à l'amélioration totale
        if (!summary.totalImprovements[metric]) {
          summary.totalImprovements[metric] = {
            totalImprovement: 0,
            count: 0
          };
        }
        
        summary.totalImprovements[metric].totalImprovement += improvement;
        summary.totalImprovements[metric].count += 1;
      });
    }
  });
  
  // Calculer les moyennes pour les améliorations totales
  Object.keys(summary.totalImprovements).forEach(metric => {
    const { totalImprovement, count } = summary.totalImprovements[metric];
    summary.totalImprovements[metric].averageImprovement = totalImprovement / count;
  });
  
  return summary;
}

/**
 * Détermine le chemin du fichier de résultats
 * @returns {string} Chemin complet du fichier
 */
function getResultsFilePath() {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const dir = path.join(__dirname, 'reports', 'workers-impact');
  return path.join(dir, `workers-impact-${timestamp}.json`);
}

/**
 * Enregistre les résultats dans un fichier JSON
 * @param {Object} results Résultats des tests
 */
async function saveResults(results) {
  const filePath = getResultsFilePath();
  const dir = path.dirname(filePath);
  
  // Créer le répertoire si nécessaire
  await fs.mkdir(dir, { recursive: true });
  
  // Enregistrer les résultats
  await fs.writeFile(filePath, JSON.stringify(results, null, 2));
  
  // Générer un rapport HTML
  await generateHtmlReport(results, dir);
}

/**
 * Génère un rapport HTML à partir des résultats
 * @param {Object} results Résultats des tests
 * @param {string} dir Répertoire de sauvegarde
 */
async function generateHtmlReport(results, dir) {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const htmlPath = path.join(dir, `workers-impact-${timestamp}.html`);
  
  const summary = results.summary;
  const pages = Object.keys(summary.improvements);
  
  let html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Impact des Web Workers sur les Web Vitals - Reboul</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 10px;
      border: 1px solid #ddd;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    .improvement {
      color: #27ae60;
      font-weight: bold;
    }
    .degradation {
      color: #e74c3c;
      font-weight: bold;
    }
    .summary {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .chart-container {
      height: 400px;
      margin: 30px 0;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <h1>Impact des Web Workers sur les Web Vitals</h1>
  <p><strong>Date du test:</strong> ${new Date(results.timestamp).toLocaleString('fr-FR')}</p>
  
  <div class="summary">
    <h2>Résumé des améliorations</h2>
    <p>Ce rapport compare les performances avec et sans l'utilisation des Web Workers.</p>
    <table>
      <tr>
        <th>Métrique</th>
        <th>Amélioration moyenne</th>
      </tr>
  `;
  
  // Ajouter le résumé des améliorations
  METRICS.forEach(metric => {
    const improvement = summary.totalImprovements[metric].averageImprovement;
    const cssClass = improvement >= 0 ? 'improvement' : 'degradation';
    
    html += `
      <tr>
        <td>${metric}</td>
        <td class="${cssClass}">${improvement.toFixed(2)}%</td>
      </tr>
    `;
  });
  
  html += `
    </table>
  </div>
  
  <h2>Résultats détaillés par page</h2>
  `;
  
  // Ajouter les résultats par page
  pages.forEach(page => {
    html += `
    <h3>${page}</h3>
    <table>
      <tr>
        <th>Métrique</th>
        <th>Avec Workers</th>
        <th>Sans Workers</th>
        <th>Différence</th>
        <th>Amélioration</th>
      </tr>
    `;
    
    METRICS.forEach(metric => {
      const data = summary.improvements[page][metric];
      const improvement = data.percentImprovement;
      const cssClass = improvement >= 0 ? 'improvement' : 'degradation';
      
      html += `
      <tr>
        <td>${metric}</td>
        <td>${data.withWorkers.toFixed(2)}${metric === 'CLS' ? '' : 'ms'}</td>
        <td>${data.withoutWorkers.toFixed(2)}${metric === 'CLS' ? '' : 'ms'}</td>
        <td>${data.difference.toFixed(2)}${metric === 'CLS' ? '' : 'ms'}</td>
        <td class="${cssClass}">${improvement.toFixed(2)}%</td>
      </tr>
      `;
    });
    
    html += `
    </table>
    
    <div class="chart-container">
      <canvas id="chart-${page.replace(/\s+/g, '-')}"></canvas>
    </div>
    `;
  });
  
  // Ajouter les scripts pour générer les graphiques
  html += `
  <script>
    window.onload = function() {
  `;
  
  pages.forEach(page => {
    html += `
      // Graphique pour ${page}
      (function() {
        const ctx = document.getElementById('chart-${page.replace(/\s+/g, '-')}');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(METRICS)},
            datasets: [
              {
                label: 'Avec Workers',
                data: [${METRICS.map(m => summary.improvements[page][m].withWorkers.toFixed(2)).join(', ')}],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
              },
              {
                label: 'Sans Workers',
                data: [${METRICS.map(m => summary.improvements[page][m].withoutWorkers.toFixed(2)).join(', ')}],
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
              }
            ]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Millisecondes (ms)'
                }
              }
            },
            plugins: {
              title: {
                display: true,
                text: 'Comparaison des métriques - ${page}'
              }
            }
          }
        });
      })();
    `;
  });
  
  html += `
    };
  </script>
</body>
</html>
  `;
  
  await fs.writeFile(htmlPath, html);
  console.log(`📊 Rapport HTML généré: ${htmlPath}`);
}

// Exécuter les tests
runTests().catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
}); 