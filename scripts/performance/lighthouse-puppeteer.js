/**
 * Script d'audit Lighthouse pour le projet Reboul (Version Puppeteer)
 * 
 * Cette version utilise Puppeteer au lieu de chrome-launcher
 * pour résoudre le problème "lighthouse is not a function"
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const lighthouseLib = require('lighthouse');
const lighthouse = lighthouseLib.lighthouse || lighthouseLib.default || lighthouseLib;
const { format } = require('date-fns');

// Pages prioritaires à auditer
const PAGES = [
  { name: 'Accueil', url: 'http://localhost:3000' },
  { name: 'Catalogue', url: 'http://localhost:3000/catalogue' },
  { name: 'Produit', url: 'http://localhost:3000/produit/1' },
  { name: 'Checkout', url: 'http://localhost:3000/checkout' }
];

// Configuration Lighthouse
const LIGHTHOUSE_CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'desktop',
    screenEmulation: { 
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false
    },
    emulatedUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
  }
};

// Exécute Lighthouse sur une URL avec Puppeteer
async function runLighthouseWithPuppeteer(url, config) {
  // Lancer Puppeteer
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Obtenir le port de débogage WebSocket
    const pages = await browser.pages();
    const page = pages[0];
    const client = await page.target().createCDPSession();
    
    // Version simplifiée qui utilise le port WebSocket de Puppeteer
    const { lhr, report } = await lighthouse(url, {
      port: (new URL(browser.wsEndpoint())).port,
      output: 'html',
      logLevel: 'info',
      ...config
    });
    
    return { lhr, report };
  } finally {
    await browser.close();
  }
}

// Créer le dossier de rapports s'il n'existe pas
function createReportDirectory() {
  const reportsDir = path.join(__dirname, '../../../reports/lighthouse');
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  return reportsDir;
}

// Sauvegarde le rapport HTML
function saveReport(reportHtml, pageName, reportsDir) {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
  const reportPath = path.join(reportsDir, `${pageName.toLowerCase()}_${timestamp}.html`);
  
  fs.writeFileSync(reportPath, reportHtml);
  
  return reportPath;
}

// Extraire les métriques Web Vitals
function extractWebVitals(lhr) {
  const webVitals = {
    lcp: lhr.audits['largest-contentful-paint'].numericValue,
    fid: lhr.audits['max-potential-fid'].numericValue,
    cls: lhr.audits['cumulative-layout-shift'].numericValue,
    tti: lhr.audits['interactive'].numericValue,
    tbt: lhr.audits['total-blocking-time'].numericValue,
    fcp: lhr.audits['first-contentful-paint'].numericValue,
    ttfb: lhr.audits['server-response-time'].numericValue
  };
  
  return webVitals;
}

// Créer le résumé des métriques
function createWebVitalsSummary(auditResults) {
  const summaryPath = path.join(createReportDirectory(), `summary_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`);
  
  fs.writeFileSync(summaryPath, JSON.stringify(auditResults, null, 2));
  
  return summaryPath;
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage des audits Lighthouse (via Puppeteer) pour Reboul...');
  
  const reportsDir = createReportDirectory();
  const auditResults = [];
  
  for (const page of PAGES) {
    console.log(`\n📋 Audit de la page ${page.name}: ${page.url}`);
    
    try {
      const { lhr, report } = await runLighthouseWithPuppeteer(page.url, LIGHTHOUSE_CONFIG);
      
      // Sauvegarder le rapport
      const reportPath = saveReport(report, page.name, reportsDir);
      console.log(`📄 Rapport sauvegardé: ${reportPath}`);
      
      // Extraire les métriques principales
      const webVitals = extractWebVitals(lhr);
      const scores = {
        performance: lhr.categories.performance.score * 100,
        accessibility: lhr.categories.accessibility.score * 100,
        bestPractices: lhr.categories['best-practices'].score * 100,
        seo: lhr.categories.seo.score * 100
      };
      
      // Ajouter les résultats au tableau
      auditResults.push({
        page: page.name,
        url: page.url,
        scores,
        webVitals,
        timestamp: new Date().toISOString()
      });
      
      // Afficher un résumé des résultats
      console.log('📊 Résultats:');
      console.log(`   Performance: ${scores.performance.toFixed(0)}%`);
      console.log(`   LCP: ${(webVitals.lcp / 1000).toFixed(2)}s`);
      console.log(`   CLS: ${webVitals.cls.toFixed(3)}`);
      console.log(`   FID (estimé): ${webVitals.fid.toFixed(0)}ms`);
      console.log(`   TTI: ${(webVitals.tti / 1000).toFixed(2)}s`);
      
    } catch (error) {
      console.error(`❌ Erreur lors de l'audit de ${page.name}:`, error);
    }
  }
  
  // Créer le résumé des résultats
  const summaryPath = createWebVitalsSummary(auditResults);
  console.log(`\n✅ Résumé des audits sauvegardé: ${summaryPath}`);
  console.log('\n🎯 Audits terminés!');
}

// Exécuter le script
main().catch(error => {
  console.error('Erreur lors de l\'exécution des audits:', error);
  process.exit(1);
}); 