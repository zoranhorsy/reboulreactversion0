#!/usr/bin/env node

/**
 * Script d'optimisation des imports JavaScript pour Reboul
 * 
 * Ce script:
 * 1. Détecte les imports non optimisés de bibliothèques comme lodash
 * 2. Les remplace par des imports spécifiques plus efficaces
 * 3. Génère un rapport des optimisations effectuées
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Configuration
const config = {
  srcDir: path.resolve(process.cwd(), 'src'),
  reportsDir: path.resolve(process.cwd(), 'reports', 'optimizations'),
  
  // Bibliothèques à optimiser et leurs patterns
  libraries: {
    'lodash': {
      // Détecter: import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'
      pattern: /import\s+{([^}]+)}\s+from\s+['"]lodash['"]/g,
      // Transformer en: import debounce from 'lodash/debounce'
      transform: (match, imports) => {
        const methods = imports
          .split(',')
          .map(method => method.trim())
          .filter(Boolean);
        
        return methods
          .map(method => `import ${method} from 'lodash/${method}'`)
          .join('\n');
      },
      isHeavy: true
    },
    'date-fns': {
      // Détecter: import format from 'date-fns/format'
import isValid from 'date-fns/isValid'
      pattern: /import\s+{([^}]+)}\s+from\s+['"]date-fns['"]/g,
      // Transformer en: import format from 'date-fns/format'
      transform: (match, imports) => {
        const methods = imports
          .split(',')
          .map(method => method.trim())
          .filter(Boolean);
        
        return methods
          .map(method => `import ${method} from 'date-fns/${method}'`)
          .join('\n');
      },
      isHeavy: true
    },
    'framer-motion': {
      // Chercher les imports globaux de framer-motion
      pattern: /import\s+{([^}]+)}\s+from\s+['"]framer-motion['"]/g,
      // Commenter pour informer sur la possibilité d'utiliser des animations CSS
      transform: (match, imports) => {
        return `${match}\n// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle`;
      },
      isHeavy: true,
      onlyComment: true
    }
  },
  
  // Fichiers à exclure
  excludePatterns: [
    '**/node_modules/**',
    '**/.next/**',
    '**/tests/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/reports/**'
  ]
};

// Assurez-vous que le répertoire des rapports existe
if (!fs.existsSync(config.reportsDir)) {
  fs.mkdirSync(config.reportsDir, { recursive: true });
}

// Trouver tous les fichiers JavaScript/TypeScript
function findJSFiles() {
  return glob.sync(`${config.srcDir}/**/*.{js,jsx,ts,tsx}`, {
    ignore: config.excludePatterns
  });
}

// Analyser et optimiser les imports
function optimizeImports() {
  const files = findJSFiles();
  console.log(`🔍 Analyse de ${files.length} fichiers...`);
  
  const results = {
    optimized: [],
    commented: [],
    unchanged: []
  };
  
  let totalOptimizedImports = 0;
  let totalCommentedImports = 0;
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    let fileOptimized = false;
    let fileCommented = false;
    
    // Parcourir chaque bibliothèque à optimiser
    Object.entries(config.libraries).forEach(([libName, libConfig]) => {
      const { pattern, transform, onlyComment } = libConfig;
      
      let matches = content.match(pattern);
      if (matches && matches.length) {
        // Si le fichier contient des imports à optimiser
        if (onlyComment) {
          // Juste ajouter un commentaire
          content = content.replace(pattern, transform);
          fileCommented = true;
          totalCommentedImports += matches.length;
        } else {
          // Optimiser l'import
          content = content.replace(pattern, (match, imports) => {
            return transform(match, imports);
          });
          fileOptimized = true;
          totalOptimizedImports += matches.length;
        }
      }
    });
    
    // Sauvegarder si modifié
    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      
      if (fileOptimized) {
        results.optimized.push({
          file: path.relative(process.cwd(), file),
          originalContent,
          newContent: content
        });
      }
      
      if (fileCommented) {
        results.commented.push({
          file: path.relative(process.cwd(), file)
        });
      }
    } else {
      results.unchanged.push({
        file: path.relative(process.cwd(), file)
      });
    }
  });
  
  // Générer un rapport
  const reportContent = generateReport(results, totalOptimizedImports, totalCommentedImports);
  const reportPath = path.join(config.reportsDir, 'import-optimizations.md');
  fs.writeFileSync(reportPath, reportContent);
  
  console.log(`📊 Résumé:`);
  console.log(`- ${totalOptimizedImports} imports optimisés dans ${results.optimized.length} fichiers`);
  console.log(`- ${totalCommentedImports} suggestions ajoutées dans ${results.commented.length} fichiers`);
  console.log(`- ${results.unchanged.length} fichiers non modifiés`);
  console.log(`✅ Rapport généré: ${reportPath}`);
  
  return results;
}

// Générer un rapport détaillé des optimisations
function generateReport(results, totalOptimizedImports, totalCommentedImports) {
  return `# Rapport d'optimisation des imports

## Résumé
- **Imports optimisés**: ${totalOptimizedImports} dans ${results.optimized.length} fichiers
- **Suggestions ajoutées**: ${totalCommentedImports} dans ${results.commented.length} fichiers
- **Fichiers non modifiés**: ${results.unchanged.length}

## Fichiers optimisés

${results.optimized.map(item => `### ${item.file}`).join('\n\n')}

## Fichiers avec suggestions

${results.commented.map(item => `- ${item.file}`).join('\n')}

## Comment fonctionne cette optimisation?

### Pour Lodash
Transformer ceci:
\`\`\`js
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'
\`\`\`

En ceci:
\`\`\`js
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'
\`\`\`

### Pour date-fns
Transformer ceci:
\`\`\`js
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
\`\`\`

En ceci:
\`\`\`js
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
\`\`\`

## Impact sur la taille du bundle

- **Import standard de lodash**: ~70KB
- **Import spécifique de lodash**: ~2-3KB par méthode
- **Gain total estimé**: ${Math.round(totalOptimizedImports * 10)}KB

## Prochaines étapes recommandées

1. Vérifier que les applications fonctionnent correctement après ces optimisations
2. Exécuter \`npm run audit:bundle\` pour mesurer l'impact sur la taille du bundle
3. Examiner les suggestions pour remplacer framer-motion par des animations CSS
`;
}

// Exécuter l'optimisation
function main() {
  console.log('🚀 Démarrage de l\'optimisation des imports...');
  const results = optimizeImports();
  console.log('✨ Optimisation terminée !');
}

if (require.main === module) {
  main();
}

module.exports = { optimizeImports }; 