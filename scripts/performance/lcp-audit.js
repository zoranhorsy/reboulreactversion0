#!/usr/bin/env node

/**
 * Script d'audit spécifique pour le Largest Contentful Paint (LCP)
 * 
 * Ce script utilise Puppeteer pour mesurer le LCP sur les pages critiques
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Configuration
const config = {
  // URLs à tester
  urls: [
    'http://localhost:3000',               // Page d'accueil
    'http://localhost:3000/catalogue',     // Catalogue
    'http://localhost:3000/produit/1',     // Page produit
    'http://localhost:3000/checkout',      // Checkout
    'http://localhost:3000/the-corner'     // The Corner
  ],
  
  // Répertoire pour sauvegarder les rapports
  outputDir: path.join(process.cwd(), 'reports', 'performance', 'lcp')
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

// Mesurer le LCP d'une page
async function measureLCP(url) {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 1280,
      height: 720
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Injecter le code pour mesurer le LCP
    await page.evaluateOnNewDocument(() => {
      window.lcpData = {
        startTime: performance.now(),
        value: 0,
        element: null,
        url: null,
        size: 0,
        loadTime: 0
      };
      
      // Observer le LCP
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (lastEntry) {
          window.lcpData.value = lastEntry.startTime;
          window.lcpData.loadTime = performance.now() - window.lcpData.startTime;
          
          // Informations sur l'élément LCP si disponible
          if (lastEntry.element) {
            const element = lastEntry.element;
            window.lcpData.element = {
              tagName: element.tagName,
              id: element.id,
              className: element.className,
              innerText: element.innerText ? element.innerText.substring(0, 100) : '',
            };
            
            // Si c'est une image
            if (element.tagName === 'IMG') {
              window.lcpData.url = element.src;
              window.lcpData.size = {
                width: element.width,
                height: element.height
              };
            } 
            // Si l'élément a une image de fond
            else if (window.getComputedStyle(element).backgroundImage !== 'none') {
              window.lcpData.url = window.getComputedStyle(element).backgroundImage;
            }
          }
        }
      });
      
      try {
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        console.log('LCP API not supported');
      }
    });
    
    // Naviguer vers l'URL
    console.log(`🧭 Navigation vers ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Attendre pour le LCP
    console.log(`⏳ Attente pour mesurer le LCP...`);
    await wait(5000);
    
    // Prendre une capture d'écran
    const screenshotPath = path.join(config.outputDir, `${url.replace(/[^a-z0-9]/gi, '_')}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    
    // Récupérer les données de LCP
    const lcpData = await page.evaluate(() => window.lcpData);
    
    // Marquer l'élément LCP sur la capture d'écran si possible
    if (lcpData.element) {
      try {
        // Trouver l'élément LCP et le marquer
        await page.evaluate(() => {
          const element = document.querySelector(`${window.lcpData.element.tagName}${window.lcpData.element.id ? `#${window.lcpData.element.id}` : ''}${window.lcpData.element.className ? `.${window.lcpData.element.className.split(' ').join('.')}` : ''}`);
          
          if (element) {
            // Créer un cadre autour de l'élément LCP
            const rect = element.getBoundingClientRect();
            const overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.top = `${rect.top}px`;
            overlay.style.left = `${rect.left}px`;
            overlay.style.width = `${rect.width}px`;
            overlay.style.height = `${rect.height}px`;
            overlay.style.border = '3px solid red';
            overlay.style.zIndex = '9999';
            overlay.style.pointerEvents = 'none';
            
            // Ajouter un label
            const label = document.createElement('div');
            label.style.position = 'absolute';
            label.style.top = `${rect.top}px`;
            label.style.left = `${rect.left}px`;
            label.style.background = 'red';
            label.style.color = 'white';
            label.style.padding = '4px';
            label.style.fontSize = '12px';
            label.innerText = `LCP: ${(window.lcpData.value / 1000).toFixed(2)}s`;
            label.style.zIndex = '10000';
            
            document.body.appendChild(overlay);
            document.body.appendChild(label);
          }
        });
        
        // Prendre une capture avec la marque
        const markedScreenshotPath = path.join(config.outputDir, `${url.replace(/[^a-z0-9]/gi, '_')}_marked.png`);
        await page.screenshot({ path: markedScreenshotPath, fullPage: false });
      } catch (error) {
        console.warn(`⚠️ Impossible de marquer l'élément LCP: ${error.message}`);
      }
    }
    
    // Récupérer les ressources chargées
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(r => ['img', 'css', 'script', 'fetch', 'xmlhttprequest'].includes(r.initiatorType))
        .map(resource => ({
          name: resource.name,
          type: resource.initiatorType,
          size: resource.transferSize,
          duration: resource.duration,
          startTime: resource.startTime
        }))
        .sort((a, b) => a.startTime - b.startTime);
    });
    
    return {
      url,
      lcp: lcpData.value,
      lcpElement: lcpData.element,
      lcpImageUrl: lcpData.url,
      lcpImageSize: lcpData.size,
      loadTime: lcpData.loadTime,
      screenshotPath,
      resources: resources.slice(0, 10) // Limiter aux 10 premières ressources
    };
    
  } catch (error) {
    console.error(`❌ Erreur lors de la mesure de ${url}:`, error);
    return {
      url,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

// Générer le rapport LCP
function generateReport(results) {
  // Créer un rapport HTML
  const reportPath = path.join(config.outputDir, 'lcp-report.html');
  
  const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport LCP Reboul</title>
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
    <h1>Rapport de Performance LCP Reboul</h1>
    <p>Date du test: ${new Date().toLocaleString()}</p>
    
    <h2>Résumé</h2>
    <table>
      <thead>
        <tr>
          <th>Page</th>
          <th>LCP (s)</th>
          <th>Évaluation</th>
          <th>Élément LCP</th>
        </tr>
      </thead>
      <tbody>
        ${results.map(result => `
        <tr>
          <td>${result.url}</td>
          <td>${result.error ? 'Erreur' : (result.lcp / 1000).toFixed(2) + 's'}</td>
          <td class="${result.error ? 'metric-poor' : getLCPRatingClass(result.lcp)}">${result.error ? 'Erreur' : getLCPRating(result.lcp)}</td>
          <td>${result.error ? result.error : (result.lcpElement ? result.lcpElement.tagName : 'Non détecté')}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <h2>Détails par page</h2>
    ${results.map(result => `
    <div class="page-metrics">
      <h3>${result.url}</h3>
      ${result.error ? `
        <p class="metric-poor">❌ Erreur: ${result.error}</p>
      ` : `
        <p>LCP: <span class="${getLCPRatingClass(result.lcp)}">${(result.lcp / 1000).toFixed(2)}s</span></p>
        <p>Temps de chargement total: ${(result.loadTime / 1000).toFixed(2)}s</p>
        
        ${result.lcpElement ? `
        <h4>Élément LCP détecté:</h4>
        <ul>
          <li>Type: ${result.lcpElement.tagName}</li>
          <li>ID: ${result.lcpElement.id || 'Non défini'}</li>
          <li>Classes: ${result.lcpElement.className || 'Non définies'}</li>
          ${result.lcpImageUrl ? `<li>URL de l'image: ${result.lcpImageUrl}</li>` : ''}
          ${result.lcpImageSize ? `<li>Dimensions: ${result.lcpImageSize.width}x${result.lcpImageSize.height}px</li>` : ''}
        </ul>
        ` : '<p>Aucun élément LCP détecté</p>'}
        
        <h4>Capture d'écran:</h4>
        <img src="${path.relative(config.outputDir, result.screenshotPath)}" alt="Capture d'écran de ${result.url}" class="screenshot">
        
        <h4>10 premières ressources chargées:</h4>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Ressource</th>
              <th>Taille</th>
              <th>Temps de chargement</th>
            </tr>
          </thead>
          <tbody>
            ${result.resources ? result.resources.map(resource => `
            <tr>
              <td>${resource.type}</td>
              <td>${resource.name.substring(0, 50)}${resource.name.length > 50 ? '...' : ''}</td>
              <td>${(resource.size / 1024).toFixed(1)} KB</td>
              <td>${resource.duration.toFixed(0)} ms</td>
            </tr>
            `).join('') : ''}
          </tbody>
        </table>
        
        <div class="recommendations">
          <h3>Recommandations</h3>
          <ul>
            ${result.lcp > 2500 ? `
              <li>L'élément LCP charge trop lentement. Utilisez l'attribut <code>priority</code> sur cette image.</li>
              <li>Préchargez cette ressource avec <code>&lt;link rel="preload" href="${result.lcpImageUrl || ''}" as="image"&gt;</code>.</li>
              <li>Optimisez l'image avec un format plus efficace (WebP/AVIF) et une compression adaptée.</li>
              <li>Utilisez le composant OptimizedImage avec l'attribut isLCP=true.</li>
            ` : ''}
            ${result.lcp > 4000 ? `
              <li>Envisagez d'utiliser un service de CDN pour distribuer cette image.</li>
              <li>Réduisez la taille et la complexité de la page pour accélérer le chargement.</li>
            ` : ''}
            <li>Assurez-vous que les dimensions de l'image sont spécifiées pour réduire le CLS.</li>
          </ul>
        </div>
      `}
    </div>
    `).join('')}
    
    <h2>Prochaines étapes recommandées</h2>
    <ul>
      <li>Optimisez davantage les images LCP en utilisant des formats modernes (WebP/AVIF)</li>
      <li>Implémentez la technique LQIP (Low Quality Image Placeholders) pour toutes les images critiques</li>
      <li>Réduisez la taille des bundles JavaScript pour accélérer l'interactivité</li>
      <li>Utilisez le component OptimizedImage avec l'attribut isLCP=true pour toutes les images critiques</li>
      <li>Ajoutez des préchargements explicites pour les polices et les images héro</li>
    </ul>
  </body>
  </html>
  `;
  
  fs.writeFileSync(reportPath, htmlTemplate);
  console.log(`✅ Rapport généré: ${reportPath}`);
}

// Obtenir la classe CSS pour l'évaluation du LCP
function getLCPRatingClass(lcp) {
  if (lcp <= 2500) return 'metric-good';
  if (lcp <= 4000) return 'metric-medium';
  return 'metric-poor';
}

// Obtenir l'évaluation textuelle du LCP
function getLCPRating(lcp) {
  if (lcp <= 2500) return 'Bon';
  if (lcp <= 4000) return 'À améliorer';
  return 'Mauvais';
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage de l\'audit LCP...');
  createOutputDir();
  
  const results = [];
  
  for (const url of config.urls) {
    console.log(`\n📊 Audit de ${url}`);
    const result = await measureLCP(url);
    results.push(result);
  }
  
  generateReport(results);
  
  console.log('\n✅ Audit LCP terminé!');
}

// Exécuter le script
main().catch(error => {
  console.error('❌ Erreur lors de l\'exécution de l\'audit:', error);
  process.exit(1);
}); 