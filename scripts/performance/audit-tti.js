#!/usr/bin/env node

/**
 * Script d'audit pour le Time to Interactive (TTI) et blocage JavaScript
 * 
 * Ce script analyse spécifiquement les problèmes liés au TTI:
 * - Long tasks bloquant le thread principal
 * - JavaScript inutilisé ou trop volumineux
 * - Ordre de chargement des scripts
 * - Problèmes d'hydratation React
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const puppeteer = require('puppeteer');
const { table } = require('table');

// Configuration
const config = {
  // URLs à tester
  urls: [
    'http://localhost:3000',
    'http://localhost:3000/catalogue',
    'http://localhost:3000/produit/1',
    'http://localhost:3000/checkout'
  ],
  
  // Options Lighthouse
  lighthouseOptions: {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance'],
    throttling: {
      cpuSlowdownMultiplier: 2,
      rttMs: 40,
      throughputKbps: 10240
    }
  },
  
  // Seuils pour les métriques
  thresholds: {
    TTI: 3800,
    TBT: 200,
    TTFB: 800,
    LCP: 2500,
    FCP: 1800
  },
  
  // Répertoire pour sauvegarder les rapports
  outputDir: path.join(process.cwd(), 'reports', 'performance', 'tti')
};

// Vérifier les dépendances
function checkDependencies() {
  try {
    require.resolve('lighthouse');
    require.resolve('chrome-launcher');
    require.resolve('puppeteer');
    require.resolve('table');
    console.log('✅ Dépendances trouvées');
  } catch (error) {
    console.log('⚠️  Installation des dépendances...');
    execSync('npm install --save-dev lighthouse chrome-launcher puppeteer table', { stdio: 'inherit' });
  }
}

// Créer le répertoire de sortie
function createOutputDir() {
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
    console.log(`✅ Répertoire créé: ${config.outputDir}`);
  }
}

// Lancer Lighthouse pour mesurer le TTI
async function runLighthouseAudit(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  config.lighthouseOptions.port = chrome.port;
  
  try {
    const results = await lighthouse(url, config.lighthouseOptions);
    const { lhr } = results;
    
    const metrics = {
      url,
      TTI: lhr.audits['interactive'].numericValue,
      TBT: lhr.audits['total-blocking-time'].numericValue,
      TTFB: lhr.audits['server-response-time'].numericValue,
      LCP: lhr.audits['largest-contentful-paint'].numericValue,
      FCP: lhr.audits['first-contentful-paint'].numericValue,
      
      // Scores
      TTI_score: lhr.audits['interactive'].score,
      TBT_score: lhr.audits['total-blocking-time'].score,
      
      // Détails sur le blocage JavaScript
      jsExecutionTime: lhr.audits['bootup-time'].numericValue,
      mainThreadWork: lhr.audits['mainthread-work-breakdown'].numericValue,
      
      // Taille du JavaScript
      totalJSBytes: lhr.audits['total-byte-weight'].details?.items.filter(item => 
        item.url.endsWith('.js') || item.url.includes('js?')
      ).reduce((sum, item) => sum + item.totalBytes, 0) || 0,
      
      // Liste des scripts bloquants
      blockingJS: lhr.audits['render-blocking-resources'].details?.items.filter(item => 
        item.url.endsWith('.js') || item.url.includes('js?')
      ).map(item => item.url) || []
    };
    
    // Sauvegarder le rapport Lighthouse complet
    const reportFilename = `${url.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
    fs.writeFileSync(
      path.join(config.outputDir, reportFilename),
      JSON.stringify(lhr, null, 2)
    );
    
    return metrics;
  } finally {
    await chrome.kill();
  }
}

// Exécuter une analyse de trace avec Puppeteer pour les long tasks
async function runPuppeteerTrace(url) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    // Activer la collecte des performances
    await page.tracing.start({ 
      path: path.join(config.outputDir, `trace_${url.replace(/[^a-z0-9]/gi, '_')}.json`),
      categories: ['devtools.timeline']
    });
    
    // Collecter les longTasks
    const longTasks = [];
    const longTaskListener = task => {
      if (task.name === 'EventDispatch' || task.name === 'EvaluateScript') {
        if (task.dur > 50000) { // 50ms
          longTasks.push({
            name: task.name,
            duration: task.dur / 1000,
            startTime: task.ts / 1000
          });
        }
      }
    };
    
    page.on('domcontentloaded', () => {
      page.evaluate(() => {
        window.performance.mark('dom_content_loaded');
      });
    });
    
    // Naviguer vers l'URL et attendre que la page soit interactive
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Attendre 10 secondes pour s'assurer que tout est chargé
    await page.waitForTimeout(10000);
    
    // Arrêter la collecte de traces
    const traceData = JSON.parse(await page.tracing.stop());
    
    // Analyser les events pour trouver les long tasks
    const timelineEvents = traceData.traceEvents.filter(e => 
      e.cat === 'devtools.timeline' && 
      (e.name === 'EvaluateScript' || e.name === 'EventDispatch')
    );
    
    const longTasksDetails = timelineEvents
      .filter(e => e.dur > 50000) // > 50ms
      .map(e => ({
        type: e.name,
        duration: e.dur / 1000, // microseconds to milliseconds
        startTime: e.ts / 1000,
        // Ajouter des détails supplémentaires si disponibles
        details: e.args && e.args.data ? e.args.data : {}
      }))
      .sort((a, b) => b.duration - a.duration); // Trier par durée décroissante
    
    // Calculer le temps total des long tasks
    const totalLongTaskTime = longTasksDetails.reduce((sum, task) => sum + task.duration, 0);
    
    return {
      longTasks: longTasksDetails,
      longTasksCount: longTasksDetails.length,
      totalLongTaskTime
    };
  } finally {
    await browser.close();
  }
}

// Analyser le bundle JS
async function analyzeBundleSize() {
  try {
    console.log('📊 Analyse de la taille du bundle...');
    
    // Vérifier si next-bundle-analyzer est installé
    try {
      require.resolve('next-bundle-analyzer');
    } catch (error) {
      console.log('⚠️  Installation de next-bundle-analyzer...');
      execSync('npm install --save-dev next-bundle-analyzer', { stdio: 'inherit' });
    }
    
    // Exécuter l'analyse du bundle
    process.env.ANALYZE = 'true';
    execSync('next build', { stdio: 'inherit' });
    
    console.log('✅ Analyse du bundle terminée');
    
    return {
      reportPath: path.join(process.cwd(), '.next', 'analyze')
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse du bundle:', error);
    return null;
  }
}

// Générer un résumé des problèmes liés au TTI
function generateSummary(metricsArray, traceResults) {
  const data = [
    ['URL', 'TTI (ms)', 'TBT (ms)', 'Long Tasks', 'JS Size (KB)', 'Problèmes']
  ];
  
  for (let i = 0; i < metricsArray.length; i++) {
    const metrics = metricsArray[i];
    const trace = traceResults[i];
    
    // Identifier les problèmes spécifiques
    const issues = [];
    
    if (metrics.TTI > config.thresholds.TTI) {
      issues.push('TTI trop élevé');
    }
    
    if (metrics.TBT > config.thresholds.TBT) {
      issues.push('Blocage excessif du thread principal');
    }
    
    if (trace.longTasksCount > 5) {
      issues.push(`${trace.longTasksCount} tâches longues`);
    }
    
    if (metrics.totalJSBytes > 500000) {
      issues.push('Bundle JS trop volumineux');
    }
    
    if (metrics.blockingJS.length > 0) {
      issues.push(`${metrics.blockingJS.length} scripts bloquants`);
    }
    
    const url = metrics.url.replace('http://localhost:3000', '');
    
    data.push([
      url || '/',
      Math.round(metrics.TTI),
      Math.round(metrics.TBT),
      trace.longTasksCount,
      Math.round(metrics.totalJSBytes / 1024),
      issues.join(', ')
    ]);
  }
  
  // Générer le tableau formaté
  return table(data);
}

// Générer des recommandations basées sur les problèmes trouvés
function generateRecommendations(metricsArray, traceResults) {
  const recommendations = [];
  
  // Vérifier si le TTI est trop élevé en moyenne
  const avgTTI = metricsArray.reduce((sum, m) => sum + m.TTI, 0) / metricsArray.length;
  if (avgTTI > config.thresholds.TTI) {
    recommendations.push(
      '⚠️ TTI trop élevé (moyenne: ' + Math.round(avgTTI) + 'ms)',
      '  - Utiliser des imports dynamiques pour le code non critique',
      '  - Différer le chargement des scripts tiers',
      '  - Optimiser l\'ordre de chargement des composants React'
    );
  }
  
  // Vérifier s'il y a beaucoup de tâches longues
  const totalLongTasks = traceResults.reduce((sum, t) => sum + t.longTasksCount, 0);
  if (totalLongTasks > 10) {
    recommendations.push(
      '⚠️ Nombreuses tâches longues (' + totalLongTasks + ' au total)',
      '  - Décomposer le travail JavaScript en plus petites tâches',
      '  - Utiliser des web workers pour le traitement intensif',
      '  - Implémenter le modèle RAIL pour les tâches utilisateur'
    );
  }
  
  // Vérifier la taille du JavaScript
  const avgJSSize = metricsArray.reduce((sum, m) => sum + m.totalJSBytes, 0) / metricsArray.length;
  if (avgJSSize > 500000) {
    recommendations.push(
      '⚠️ Bundle JavaScript trop volumineux (' + Math.round(avgJSSize / 1024) + 'KB en moyenne)',
      '  - Réduire les dépendances externes',
      '  - Configurer le tree-shaking pour éliminer le code inutilisé',
      '  - Diviser le bundle en chunks plus petits'
    );
  }
  
  // Vérifier les scripts bloquants
  const blockingScriptsCount = metricsArray.reduce(
    (sum, m) => sum + m.blockingJS.length, 0
  );
  if (blockingScriptsCount > 0) {
    recommendations.push(
      '⚠️ Scripts bloquant le rendu (' + blockingScriptsCount + ' au total)',
      '  - Utiliser defer ou async pour les scripts non critiques',
      '  - Déplacer les scripts en bas de page',
      '  - Charger les scripts tiers de façon asynchrone'
    );
  }
  
  // Problèmes d'hydratation
  const highTBT = metricsArray.filter(m => m.TBT > config.thresholds.TBT).length;
  if (highTBT > 0) {
    recommendations.push(
      '⚠️ Temps de blocage élevé sur ' + highTBT + ' pages',
      '  - Optimiser l\'hydratation React avec une stratégie progressive',
      '  - Diviser les composants complexes en plus petits morceaux',
      '  - Revoir les contexts React et leur initialisation'
    );
  }
  
  // Recommendations spécifiques pour AuthContext
  if (avgTTI > config.thresholds.TTI) {
    recommendations.push(
      '⚠️ Optimisations spécifiques pour l\'authentification:',
      '  - Différer l\'initialisation de AuthContext',
      '  - Réduire la fréquence des vérifications périodiques',
      '  - Éliminer les console.log en production',
      '  - Mémoiser les fonctions et valeurs avec useMemo et useCallback'
    );
  }
  
  return recommendations.join('\n');
}

// Fonction principale
async function main() {
  console.log('🕹️  Démarrage de l\'audit TTI et blocage JavaScript...');
  
  checkDependencies();
  createOutputDir();
  
  const metricsArray = [];
  const traceResults = [];
  
  // Tester chaque URL
  for (const url of config.urls) {
    console.log(`\n📊 Test de ${url}...`);
    
    try {
      // Exécuter Lighthouse
      console.log('  ⏱️  Mesure du TTI avec Lighthouse...');
      const metrics = await runLighthouseAudit(url);
      metricsArray.push(metrics);
      
      // Exécuter l'analyse Puppeteer
      console.log('  🔍 Analyse des long tasks avec Puppeteer...');
      const traceResult = await runPuppeteerTrace(url);
      traceResults.push(traceResult);
      
      // Afficher un résumé partiel
      console.log(`  ✅ Résultats pour ${url}:`);
      console.log(`    - TTI: ${Math.round(metrics.TTI)}ms (seuil: ${config.thresholds.TTI}ms)`);
      console.log(`    - TBT: ${Math.round(metrics.TBT)}ms (seuil: ${config.thresholds.TBT}ms)`);
      console.log(`    - Long tasks: ${traceResult.longTasksCount}`);
      console.log(`    - Taille JS: ${Math.round(metrics.totalJSBytes / 1024)}KB`);
    } catch (error) {
      console.error(`  ❌ Erreur lors de l'audit de ${url}:`, error);
    }
  }
  
  // Générer des rapports de synthèse
  console.log('\n📝 Génération des rapports...');
  
  // Résumé sous forme de tableau
  const summary = generateSummary(metricsArray, traceResults);
  fs.writeFileSync(
    path.join(config.outputDir, 'summary.txt'),
    summary
  );
  
  // Rapport JSON détaillé
  fs.writeFileSync(
    path.join(config.outputDir, 'detailed_metrics.json'),
    JSON.stringify({ metrics: metricsArray, traces: traceResults }, null, 2)
  );
  
  // Recommandations
  const recommendations = generateRecommendations(metricsArray, traceResults);
  fs.writeFileSync(
    path.join(config.outputDir, 'recommendations.txt'),
    recommendations
  );
  
  // Analyser la taille du bundle
  console.log('\n📦 Analyse de la taille du bundle JavaScript...');
  await analyzeBundleSize();
  
  // Afficher les résultats
  console.log('\n📊 Résumé des résultats:');
  console.log(summary);
  
  console.log('\n💡 Recommandations:');
  console.log(recommendations);
  
  console.log('\n🎉 Audit terminé!');
  console.log(`📁 Les rapports détaillés sont disponibles dans: ${config.outputDir}`);
}

main().catch(error => {
  console.error('Erreur:', error);
  process.exit(1);
}); 