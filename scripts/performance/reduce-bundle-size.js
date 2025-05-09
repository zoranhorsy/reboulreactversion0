#!/usr/bin/env node

/**
 * Script d'analyse et réduction de la taille des bundles JavaScript pour Reboul
 * 
 * Ce script:
 * 1. Analyse la taille actuelle des bundles
 * 2. Identifie les bibliothèques volumineuses
 * 3. Suggère des remplacements/optimisations
 * 4. Génère un rapport détaillé
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

// Configuration
const config = {
  srcDir: path.resolve(process.cwd(), 'src'),
  outputDir: path.resolve(process.cwd(), 'reports', 'bundle-optimization'),
  packageJsonPath: path.resolve(process.cwd(), 'package.json'),
  
  // Bibliothèques volumineuses connues
  heavyLibraries: [
    { name: 'framer-motion', size: '120KB', alternatives: ['animation-utils.css (interne)', 'css transitions'] },
    { name: 'lodash', size: '70KB', alternatives: ['optimized-utils.ts (interne)', 'imports spécifiques'] },
    { name: 'gsap', size: '140KB', alternatives: ['css animations', 'fraction de gsap'] },
    { name: 'animejs', size: '40KB', alternatives: ['css animations'] },
    { name: 'styled-components', size: '65KB', alternatives: ['tailwindcss (déjà inclus)'] },
    { name: 'three', size: '570KB', alternatives: ['chargement dynamique', 'modèles simplifiés'] },
    { name: 'recharts', size: '155KB', alternatives: ['chargement dynamique'] },
    { name: '@chakra-ui/react', size: '80KB', alternatives: ['@radix-ui (déjà inclus)'] },
    { name: 'swiper', size: '120KB', alternatives: ['embla-carousel (plus léger, déjà inclus)'] },
    { name: 'moment', size: '65KB', alternatives: ['date-fns (déjà inclus)'] },
  ],
  
  // Fichiers à exclure de l'analyse
  excludePatterns: [
    '**/node_modules/**',
    '**/.next/**',
    '**/out/**',
    '**/tests/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/reports/**'
  ]
};

// Créer le répertoire de sortie s'il n'existe pas
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Analyser le fichier package.json pour les dépendances
function analyzeDependencies() {
  console.log('📦 Analyse des dépendances dans package.json...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(config.packageJsonPath, 'utf8'));
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    
    // Identifier les bibliothèques volumineuses dans les dépendances
    const heavyDeps = config.heavyLibraries.filter(lib => 
      dependencies[lib.name] || devDependencies[lib.name]
    );
    
    console.log(`📊 Trouvé ${heavyDeps.length} bibliothèques volumineuses dans les dépendances.`);
    
    return {
      heavyDeps,
      allDeps: { ...dependencies, ...devDependencies }
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse des dépendances:', error);
    return { heavyDeps: [], allDeps: {} };
  }
}

// Analyser l'utilisation des imports dans les fichiers source
function analyzeImports() {
  console.log('🔍 Analyse des imports dans les fichiers source...');
  
  const importStats = {};
  
  try {
    // Trouver tous les fichiers JS/TS/JSX/TSX
    const files = glob.sync(`${config.srcDir}/**/*.{js,jsx,ts,tsx}`, { 
      ignore: config.excludePatterns 
    });
    
    console.log(`📄 Analyse de ${files.length} fichiers...`);
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Analyser les imports
      const imports = [];
      let match;
      
      // Regex pour capturer les imports ES6
      const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+[^;]+|[^;{]*)\s+from\s+['"]([^'"]+)['"]/g;
      
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        
        // Ignorer les imports relatifs
        if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
          imports.push(importPath);
          
          // Incrémenter le compteur pour cette bibliothèque
          const libName = importPath.split('/')[0];
          importStats[libName] = (importStats[libName] || 0) + 1;
        }
      }
      
      // Regex pour capturer require()
      const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
      
      while ((match = requireRegex.exec(content)) !== null) {
        const importPath = match[1];
        
        // Ignorer les imports relatifs
        if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
          imports.push(importPath);
          
          // Incrémenter le compteur pour cette bibliothèque
          const libName = importPath.split('/')[0];
          importStats[libName] = (importStats[libName] || 0) + 1;
        }
      }
    });
    
    return importStats;
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse des imports:', error);
    return {};
  }
}

// Analyser les imports pour les bibliothèques volumineuses spécifiques
function analyzeHeavyLibraryUsage(heavyDeps) {
  console.log('🔎 Analyse détaillée des bibliothèques volumineuses...');
  
  const usageStats = {};
  
  try {
    heavyDeps.forEach(lib => {
      const libName = lib.name;
      usageStats[libName] = { components: [], global: 0, specific: 0 };
      
      // Analyser l'utilisation de cette bibliothèque
      const files = glob.sync(`${config.srcDir}/**/*.{js,jsx,ts,tsx}`, { 
        ignore: config.excludePatterns 
      });
      
      files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const fileName = path.basename(file);
        
        // Vérifier les imports globaux (import X from 'lib')
        const globalRegex = new RegExp(`import\\s+(?:{[^}]*}|\\*\\s+as\\s+[^;]+|[^;{]*)\\s+from\\s+['"]${libName}['"]`, 'g');
        
        if (globalRegex.test(content)) {
          usageStats[libName].global++;
          usageStats[libName].components.push({
            file: fileName,
            path: file,
            type: 'global'
          });
        }
        
        // Vérifier les imports spécifiques (import X from 'lib/specific')
        const specificRegex = new RegExp(`import\\s+(?:{[^}]*}|\\*\\s+as\\s+[^;]+|[^;{]*)\\s+from\\s+['"]${libName}/([^'"]+)['"]`, 'g');
        let match;
        
        while ((match = specificRegex.exec(content)) !== null) {
          usageStats[libName].specific++;
          usageStats[libName].components.push({
            file: fileName,
            path: file,
            type: 'specific',
            submodule: match[1]
          });
        }
      });
    });
    
    return usageStats;
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse détaillée:', error);
    return {};
  }
}

// Générer des recommandations pour réduire la taille du bundle
function generateRecommendations(heavyDeps, usageStats) {
  console.log('✨ Génération des recommandations...');
  
  const recommendations = [];
  
  heavyDeps.forEach(lib => {
    const libName = lib.name;
    const usage = usageStats[libName] || { global: 0, specific: 0, components: [] };
    
    let recommendation = {
      library: libName,
      size: lib.size,
      usage: {
        global: usage.global,
        specific: usage.specific,
        total: usage.global + usage.specific
      },
      alternatives: lib.alternatives,
      recommendation: '',
      implementationStrategy: '',
      impact: ''
    };
    
    // Décider de la stratégie en fonction de l'utilisation
    if (usage.total === 0) {
      recommendation.recommendation = 'Supprimer - Non utilisée';
      recommendation.implementationStrategy = `Retirer la dépendance du package.json`;
      recommendation.impact = 'Élevé - Réduction immédiate de la taille du bundle';
    } else if (usage.global > 0 && usage.specific === 0) {
      // Utilisation globale uniquement
      if (libName === 'lodash') {
        recommendation.recommendation = 'Optimiser - Utiliser des imports spécifiques';
        recommendation.implementationStrategy = 
          `Remplacer import x from 'lodash/x' par import x from 'lodash/x'`;
        recommendation.impact = 'Élevé - Réduction significative de la taille du bundle';
      } else if (['gsap', 'three', 'recharts'].includes(libName)) {
        recommendation.recommendation = 'Chargement dynamique';
        recommendation.implementationStrategy = 
          `Utiliser les fonctions de chargement dynamique de src/lib/dynamic-loading-strategies.ts`;
        recommendation.impact = 'Élevé - Déplace la bibliothèque hors du bundle initial';
      } else if (libName === 'framer-motion') {
        recommendation.recommendation = 'Remplacer par des animations CSS';
        recommendation.implementationStrategy = 
          `Utiliser les classes d'animation de src/styles/animation-utils.css`;
        recommendation.impact = 'Moyen - Réduction progressive de la taille du bundle';
      } else if (libName === 'styled-components') {
        recommendation.recommendation = 'Migrer vers Tailwind CSS';
        recommendation.implementationStrategy = 
          `Convertir progressivement les composants styled-components en classes Tailwind`;
        recommendation.impact = 'Élevé - Réduction significative de la taille du bundle';
      } else {
        recommendation.recommendation = 'Chargement dynamique';
        recommendation.implementationStrategy = 
          `Utiliser les fonctions de chargement dynamique de src/lib/dynamic-loading-strategies.ts`;
        recommendation.impact = 'Moyen - Déplace la bibliothèque hors du bundle initial';
      }
    } else {
      // Utilisation mixte ou spécifique
      recommendation.recommendation = 'Chargement dynamique et optimisation';
      recommendation.implementationStrategy = 
        `Combiner les imports spécifiques avec le chargement dynamique`;
      recommendation.impact = 'Moyen - Amélioration progressive de la performance';
    }
    
    recommendations.push(recommendation);
  });
  
  return recommendations;
}

// Générer un rapport complet
function generateReport(analysis) {
  console.log('📄 Génération du rapport détaillé...');
  
  const { heavyDeps, usageStats, importStats, recommendations } = analysis;
  
  // Créer le contenu du rapport
  const reportContent = `# Rapport d'optimisation des bundles JavaScript

## Sommaire
- [Bibliothèques volumineuses identifiées](#bibliothèques-volumineuses-identifiées)
- [Analyse détaillée de l'utilisation](#analyse-détaillée-de-lutilisation)
- [Recommandations d'optimisation](#recommandations-doptimisation)
- [Plan d'implémentation](#plan-dimplémentation)

## Bibliothèques volumineuses identifiées

${heavyDeps.map(lib => `- **${lib.name}** (~${lib.size})`).join('\n')}

## Analyse détaillée de l'utilisation

${heavyDeps.map(lib => {
  const usage = usageStats[lib.name] || { global: 0, specific: 0, components: [] };
  return `### ${lib.name}
- **Imports globaux**: ${usage.global} fichiers
- **Imports spécifiques**: ${usage.specific} fichiers
- **Composants utilisant cette bibliothèque**:
${usage.components.slice(0, 5).map(comp => `  - ${comp.file} (${comp.type}${comp.submodule ? `: ${comp.submodule}` : ''})`).join('\n')}
${usage.components.length > 5 ? `  - ... et ${usage.components.length - 5} autres fichiers` : ''}
`;
}).join('\n')}

## Recommandations d'optimisation

${recommendations.map(rec => `### ${rec.library} (~${rec.size})
- **Recommandation**: ${rec.recommendation}
- **Stratégie d'implémentation**: ${rec.implementationStrategy}
- **Impact estimé**: ${rec.impact}
- **Utilisation actuelle**: ${rec.usage.total} fichiers (${rec.usage.global} global, ${rec.usage.specific} spécifique)
`).join('\n')}

## Plan d'implémentation

Voici un plan d'action recommandé pour réduire la taille des bundles JavaScript:

1. **Phase 1: Optimisations immédiates**
   - Supprimer les bibliothèques non utilisées
   - Convertir les imports Lodash en imports spécifiques
   - Appliquer le chargement dynamique pour les composants sous la fold

2. **Phase 2: Optimisations progressives**
   - Remplacer progressivement framer-motion par des animations CSS
   - Migrer styled-components vers Tailwind CSS
   - Appliquer le chargement conditionnel pour les fonctionnalités avancées

3. **Phase 3: Optimisations avancées**
   - Diviser les bibliothèques volumineuses en modules indépendants
   - Utiliser la stratégie de préchargement intelligent
   - Optimiser le code splitting au niveau des pages

### Exemples d'implémentation

#### Chargement dynamique basé sur la visibilité

\`\`\`jsx
// Importer les utilitaires de chargement dynamique
import { createViewportLoadedComponent } from '@/lib/dynamic-loading-strategies';

// Créer un composant à chargement différé
const LazyChart = createViewportLoadedComponent(
  () => import('@/components/Chart'), // Composant utilisant recharts
  {
    loadingComponent: <div className="h-64 w-full animate-pulse bg-zinc-100/10 rounded-md" />,
    threshold: 0.1,
    rootMargin: '200px'
  }
);

// Utilisation
<LazyChart data={chartData} />
\`\`\`

#### Chargement conditionnel

\`\`\`jsx
// Importer les utilitaires de chargement dynamique
import { createConditionalComponent } from '@/lib/dynamic-loading-strategies';

// Créer un composant chargé conditionnellement
const AdminPanel = createConditionalComponent(
  () => import('@/components/AdminPanel'),
  () => user && user.role === 'admin'
);

// Utilisation
<AdminPanel />
\`\`\`

#### Remplacement des animations framer-motion

\`\`\`jsx
// Avant (with framer-motion)
import { motion } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle;

function Card() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      Contenu
    </motion.div>
  );
}

// Après (avec CSS)
import '@/styles/animation-utils.css';

function Card() {
  return (
    <div className="animate-fade-in animate-slide-up">
      Contenu
    </div>
  );
}
\`\`\`

#### Imports spécifiques Lodash

\`\`\`js
// Avant
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle';

// Après
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';

// Ou mieux encore, utiliser nos utilitaires optimisés
import { debounce, throttle } from '@/lib/utils/optimized-utils';
\`\`\`
`;
  
  // Écrire le rapport dans un fichier
  const reportPath = path.join(config.outputDir, 'bundle-optimization-report.md');
  fs.writeFileSync(reportPath, reportContent);
  
  console.log(`✅ Rapport généré: ${reportPath}`);
  return reportPath;
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage de l\'analyse des bundles JavaScript...');
  
  // Analyser les dépendances
  const { heavyDeps, allDeps } = analyzeDependencies();
  
  // Analyser les imports dans le code source
  const importStats = analyzeImports();
  
  // Analyser l'utilisation des bibliothèques volumineuses
  const usageStats = analyzeHeavyLibraryUsage(heavyDeps);
  
  // Générer des recommandations
  const recommendations = generateRecommendations(heavyDeps, usageStats);
  
  // Générer le rapport
  const analysis = {
    heavyDeps,
    importStats,
    usageStats,
    recommendations
  };
  
  const reportPath = generateReport(analysis);
  
  console.log('\n📊 Résumé:');
  console.log(`- Bibliothèques volumineuses: ${heavyDeps.length}`);
  console.log(`- Bibliothèques les plus utilisées: ${
    Object.entries(importStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lib, count]) => `${lib} (${count})`)
      .join(', ')
  }`);
  
  console.log('\n🎯 Prochaines étapes:');
  console.log('1. Consulter le rapport détaillé');
  console.log('2. Appliquer les recommandations prioritaires');
  console.log('3. Exécuter une build avec analyse du bundle pour mesurer l\'impact');
  
  console.log('\n✨ Analyse terminée!');
}

// Exécuter le script
main().catch(error => {
  console.error('❌ Erreur lors de l\'exécution du script:', error);
  process.exit(1);
}); 