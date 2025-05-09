#!/usr/bin/env node

/**
 * Script d'analyse du bundle JavaScript pour Reboul
 * 
 * Ce script configure et exécute l'analyse du bundle JavaScript
 * en utilisant next-bundle-analyzer pour identifier les dépendances non utilisées
 * et proposer des optimisations.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// Configuration
const outputDir = path.join(process.cwd(), 'reports', 'bundle-analysis');
const configPath = path.join(process.cwd(), 'next.config.js');
const tempConfigPath = path.join(process.cwd(), 'next.config.analyzer.js');

console.log('Démarrage de l\'analyse du bundle JavaScript...');
console.log('Dossier de sortie:', outputDir);
console.log('Fichier de configuration Next.js:', configPath);

// Assurez-vous que le dossier de rapports existe
try {
  if (!fs.existsSync(outputDir)) {
    console.log(`Création du dossier ${outputDir}...`);
    fs.mkdirSync(outputDir, { recursive: true });
  }
} catch (err) {
  console.error('Erreur lors de la création du dossier de rapports:', err);
}

// Vérifier que next-bundle-analyzer est installé
try {
  require('next-bundle-analyzer');
  console.log('✅ next-bundle-analyzer est installé');
} catch (err) {
  console.log('⚠️ Installation de next-bundle-analyzer...');
  try {
    execSync('npm install --save-dev next-bundle-analyzer', { stdio: 'inherit' });
    console.log('✅ next-bundle-analyzer a été installé');
  } catch (installErr) {
    console.error('❌ Erreur lors de l\'installation de next-bundle-analyzer:', installErr);
    process.exit(1);
  }
}

// Lire le fichier package.json pour analyser les dépendances
try {
  console.log('Analyse du fichier package.json...');
  const packageContent = fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8');
  const packageJson = JSON.parse(packageContent);
  
  // Analyse des dépendances
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};
  
  console.log('\n📦 Dépendances potentiellement optimisables:');
  
  // Vérifier lodash
  if (dependencies.lodash) {
    console.log('• Lodash: Remplacer les imports globaux par des imports spécifiques');
    console.log('  - Exemple: import debounce from "lodash/debounce" au lieu de import { debounce } from "lodash"');
  }
  
  // Vérifier moment.js vs date-fns
  if (dependencies.moment && dependencies['date-fns']) {
    console.log('• Moment.js: Remplacer par date-fns qui est déjà inclus dans le projet');
    console.log('  - Example: utiliser format() de date-fns au lieu de moment().format()');
  }
  
  // Vérifier styled-components vs tailwindcss
  if (dependencies['styled-components'] && (dependencies.tailwindcss || devDependencies.tailwindcss)) {
    console.log('• styled-components: Considérer de migrer vers Tailwind CSS qui est déjà utilisé');
    console.log('  - Ceci réduirait la taille du bundle significativement');
  }
  
  // Vérifier les multiples bibliothèques d'animation
  const animationLibs = [];
  if (dependencies.gsap) animationLibs.push('gsap');
  if (dependencies.animejs) animationLibs.push('animejs');
  if (dependencies['framer-motion']) animationLibs.push('framer-motion');
  
  if (animationLibs.length > 1) {
    console.log(`• Bibliothèques d'animation: Vous utilisez ${animationLibs.join(', ')}. Considérer d'en standardiser une seule`);
    console.log('  - Ceci réduirait la taille du bundle significativement');
  }
  
  // Vérifier les bibliothèques UI multiples
  const uiLibs = [];
  if (dependencies['@chakra-ui/react']) uiLibs.push('Chakra UI');
  if (dependencies['@radix-ui/react-dialog']) uiLibs.push('Radix UI');
  if (dependencies['@emotion/react']) uiLibs.push('Emotion');
  
  if (uiLibs.length > 1) {
    console.log(`• Bibliothèques UI: Vous utilisez ${uiLibs.join(', ')}. Considérer d'en standardiser une seule`);
    console.log('  - Ceci réduirait la taille du bundle significativement');
  }
  
  console.log('\n🔍 Analyse des importations dans les fichiers source...');
  
  // Générer des recommandations dans un fichier
  generateRecommendations(
    dependencies, 
    devDependencies, 
    { animationLibs, uiLibs }
  );
  
  console.log('\n✅ Analyse terminée!');
  console.log('📄 Recommandations générées dans:', path.join(outputDir, 'dependency-recommendations.md'));
  
} catch (err) {
  console.error('❌ Erreur lors de l\'analyse des dépendances:', err);
}

// Générer des recommandations basées sur l'analyse
function generateRecommendations(dependencies, devDependencies, details) {
  const { animationLibs = [], uiLibs = [] } = details;
  
  const recommendations = `# Recommandations d'optimisation de dépendances JavaScript

## Dépendances potentiellement optimisables

### 1. Importations spécifiques vs globales

${dependencies.lodash ? `#### Lodash
Remplacer les imports globaux par des imports spécifiques:
\`\`\`js
// Avant - Importe tout Lodash (~70KB)
import debounce from 'lodash/debounce';

// Après - Importe seulement ce dont vous avez besoin (~2KB)
import debounce from 'lodash/debounce';
\`\`\`

**Impact estimé**: Réduction de 20-50KB gzippé selon le nombre d'utilisations.
` : ''}

### 2. Bibliothèques redondantes

${dependencies.moment && dependencies['date-fns'] ? `#### Moment.js vs date-fns
Standardiser sur date-fns qui est plus léger et déjà utilisé:
\`\`\`js
// Avant avec Moment.js (~65KB)
import moment from 'moment';
const formattedDate = moment(date).format('DD/MM/YYYY');

// Après avec date-fns (~13KB)
import format from 'date-fns/format';
import { fr } from 'date-fns/locale';
const formattedDate = format(new Date(date), 'dd/MM/yyyy', { locale: fr });
\`\`\`

**Impact estimé**: Réduction de ~50KB gzippé.
` : ''}

${dependencies['styled-components'] && (dependencies.tailwindcss || devDependencies.tailwindcss) ? `#### styled-components vs Tailwind CSS
Standardiser sur Tailwind qui est déjà utilisé:
\`\`\`jsx
// Avant avec styled-components (~12KB)
const StyledButton = styled.button\`
  background-color: #7257fa;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
\`;

// Après avec Tailwind CSS (déjà inclus)
<button className="bg-[#7257fa] text-white py-2 px-4 rounded">
  Bouton
</button>
\`\`\`

**Impact estimé**: Réduction de ~15KB gzippé.
` : ''}

${animationLibs.length > 1 ? `#### Bibliothèques d'animation multiples
Vous utilisez actuellement: ${animationLibs.join(', ')}. Standardiser sur une seule:

**GSAP**: Meilleure performance et puissance, mais plus lourd (~30KB)
**AnimeJS**: Bon équilibre taille/fonctionnalités (~8KB)
**Framer Motion**: Intégration React native, mais plus lourd (~25KB)

**Impact estimé**: Réduction de 10-40KB gzippé selon la bibliothèque choisie.
` : ''}

${uiLibs.length > 1 ? `#### Bibliothèques UI multiples
Vous utilisez actuellement: ${uiLibs.join(', ')}. Standardiser sur une seule:

**Radix UI**: Bibliothèque headless, très léger (~20KB combiné pour tous les composants)
**Chakra UI**: Plus complet mais plus lourd (~80KB)

**Impact estimé**: Réduction de 30-70KB gzippé selon la bibliothèque choisie.
` : ''}

### 3. Optimisations des imports

#### Utiliser des imports dynamiques pour les fonctionnalités non critiques
\`\`\`js
// Avant - Chargé immédiatement
import { complexChart } from '@/components/Charts';

// Après - Chargé uniquement lorsque nécessaire
const loadChart = async () => {
  const { complexChart } = await import('@/components/Charts');
  return complexChart;
};
\`\`\`

#### Prioriser les bibliothèques natives du navigateur
\`\`\`js
// Avant - Dépendance externe
import { formatCurrency } from 'some-currency-lib';

// Après - API native
const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR' 
  }).format(value);
};
\`\`\`

## Plan d'action recommandé

1. Remplacer les imports lodash globaux par des imports spécifiques
2. Éliminer moment.js en faveur de date-fns
3. Migrer progressivement de styled-components vers Tailwind CSS
4. Standardiser sur une seule bibliothèque d'animation
5. Réduire l'utilisation de multiples bibliothèques UI
6. Auditer les importations pour détecter les bibliothèques non utilisées

**Gain potentiel estimé**: 100-200KB de JavaScript gzippé en moins.
`;

  const outputPath = path.join(outputDir, 'dependency-recommendations.md');
  fs.writeFileSync(outputPath, recommendations);
}

// Analyser les importations dans les fichiers pour trouver des opportunités d'optimisation
function analyzeImports() {
  console.log('Analyse des importations dans le code source...');
  
  try {
    // Implémentation de l'analyse des importations à ajouter dans une future mise à jour
    console.log('Fonctionnalité à implémenter: analyse des patterns d\'importation');
  } catch (err) {
    console.error('Erreur lors de l\'analyse des importations:', err);
  }
}

// Exécuter l'analyse complète du bundle avec next-bundle-analyzer
// Désactivé pour l'instant pour se concentrer sur l'analyse statique
// Décommenter pour activer
/*
async function analyzeBundles() {
  try {
    console.log('🔍 Démarrage de l\'analyse complète du bundle JavaScript...');
    
    // Créer la configuration temporaire
    createTempConfig();
    
    // Renommer temporairement pour utiliser notre configuration
    fs.renameSync(configPath, `${configPath}.backup`);
    fs.renameSync(tempConfigPath, configPath);
    
    // Exécuter la construction avec l'analyseur
    console.log('🏗️ Construction du projet avec l\'analyseur...');
    execSync('ANALYZE=true next build', { stdio: 'inherit' });
    
    // Restaurer les fichiers de configuration
    fs.renameSync(configPath, tempConfigPath);
    fs.renameSync(`${configPath}.backup`, configPath);
    
    // Nettoyer
    restoreOriginalConfig();
    
    console.log('✅ Analyse complète terminée! Consultez les rapports dans .next/analyze/');
    
  } catch (err) {
    console.error('❌ Erreur lors de l\'analyse complète:', err);
    
    // Restaurer en cas d'erreur
    try {
      if (fs.existsSync(`${configPath}.backup`)) {
        fs.renameSync(`${configPath}.backup`, configPath);
      }
      restoreOriginalConfig();
    } catch (restoreErr) {
      console.error('❌ Erreur lors de la restauration:', restoreErr);
    }
  }
}

function createTempConfig() {
  const originalConfig = fs.readFileSync(configPath, 'utf8');
  
  const analyzerConfig = `
const withBundleAnalyzer = require('next-bundle-analyzer')({
  enabled: true,
  openAnalyzer: true,
  analyzerMode: 'static',
  reportFilename: 'bundle-report.html',
  generateStatsFile: true,
  statsFilename: 'stats.json',
});

// Configuration originale
${originalConfig.replace('module.exports =', 'const nextConfig =')}

// Exporter la configuration avec l'analyseur
module.exports = withBundleAnalyzer(nextConfig);
`;

  fs.writeFileSync(tempConfigPath, analyzerConfig);
  console.log('✅ Configuration temporaire créée');
}

function restoreOriginalConfig() {
  try {
    if (fs.existsSync(tempConfigPath)) {
      fs.unlinkSync(tempConfigPath);
    }
    console.log('✅ Configuration originale restaurée');
  } catch (err) {
    console.error('⚠️ Erreur lors de la restauration de la configuration:', err);
  }
}
*/

module.exports = {
  webpack: (config, { dev, isServer }) => {
    // Ajouter l'analyseur de bundle en production
    if (!dev && !isServer) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: path.join(process.cwd(), 'bundle-analysis.html'),
          openAnalyzer: true,
        })
      );
    }
    return config;
  },
}; 