#!/usr/bin/env node

/**
 * Script d'optimisation des imports Lodash
 * 
 * Ce script recherche et remplace les imports Lodash globaux par des imports spécifiques
 * pour réduire significativement la taille du bundle JavaScript.
 * 
 * Exemple:
 * - Avant: import { debounce, throttle } from 'lodash';
 * - Après: import debounce from 'lodash/debounce'; import throttle from 'lodash/throttle';
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Configuration
const srcDir = path.join(process.cwd(), 'src');
const reportFile = path.join(process.cwd(), 'reports', 'lodash-optimizations.md');
const backupDir = path.join(process.cwd(), 'backups', 'pre-lodash-optimization');
const dryRun = process.argv.includes('--dry-run');
const verbose = process.argv.includes('--verbose');

// Assurez-vous que les dossiers nécessaires existent
if (!dryRun) {
  if (!fs.existsSync(path.dirname(reportFile))) {
    fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  }
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
}

console.log('🔍 Analyse des imports Lodash...\n');

// Regex pour détecter différents types d'import Lodash
const lodashImportRegexes = [
  // import { func1, func2 } from 'lodash';
  /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"](lodash)['"];?/,
  // import _ from 'lodash';
  /import\s+(_)\s+from\s+['"](lodash)['"];?/,
  // import lodash from 'lodash';
  /import\s+(\w+)\s+from\s+['"](lodash)['"];?/,
  // const { func1, func2 } = require('lodash');
  /const\s+\{\s*([^}]+)\s*\}\s*=\s*require\s*\(['"](lodash)['"]\);?/,
  // const _ = require('lodash');
  /const\s+(_)\s*=\s*require\s*\(['"](lodash)['"]\);?/
];

// Trouver tous les fichiers TypeScript/JavaScript dans src
const findTsFiles = () => {
  return glob.sync('**/*.{ts,tsx,js,jsx}', {
    cwd: srcDir,
    ignore: ['**/*.d.ts', '**/node_modules/**']
  });
};

// Analyser un fichier pour les imports Lodash
const analyzeLodashImports = (filePath) => {
  const fullPath = path.join(srcDir, filePath);
  const fileContent = fs.readFileSync(fullPath, 'utf8');
  const lines = fileContent.split('\n');
  const result = { filePath, imports: [], modified: false, newContent: null };

  lodashImportRegexes.forEach(regex => {
    const match = fileContent.match(regex);
    if (match) {
      // Match[1] contient les noms des fonctions importées
      const importedFunctions = match[1]
        .split(',')
        .map(f => f.trim())
        .filter(f => f && f !== '_' && f !== 'default' && f !== 'lodash');

      if (importedFunctions.length > 0 || match[1] === '_') {
        result.imports.push({
          fullMatch: match[0],
          functions: importedFunctions.length > 0 ? importedFunctions : ['whole-library']
        });
      }
    }
  });

  return result;
};

// Optimiser les imports Lodash
const optimizeLodashImports = (fileAnalysis) => {
  if (fileAnalysis.imports.length === 0) return fileAnalysis;

  let { filePath, imports } = fileAnalysis;
  const fullPath = path.join(srcDir, filePath);
  let fileContent = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  imports.forEach(({ fullMatch, functions }) => {
    if (functions[0] === 'whole-library') {
      console.log(`⚠️  Attention: l'import global de lodash dans ${filePath} devrait être remplacé par des méthodes spécifiques.`);
      return;
    }

    // Générer les imports de remplacement
    const newImports = functions
      .map(func => `import ${func} from 'lodash/${func}';`)
      .join('\n');

    // Remplacer l'import dans le contenu du fichier
    const newContent = fileContent.replace(fullMatch, newImports);

    if (newContent !== fileContent) {
      fileContent = newContent;
      modified = true;
      console.log(`✅ Optimisé: ${filePath}`);
      if (verbose) {
        console.log(`   - De: ${fullMatch}`);
        console.log(`   - À: ${newImports}`);
      }
    }
  });

  return {
    ...fileAnalysis,
    modified,
    newContent: modified ? fileContent : null
  };
};

// Sauvegarder et appliquer les changements
const applyChanges = (fileAnalysis) => {
  if (!fileAnalysis.modified || !fileAnalysis.newContent) return false;

  const fullPath = path.join(srcDir, fileAnalysis.filePath);
  
  // Créer une sauvegarde si ce n'est pas une simulation
  if (!dryRun) {
    const backupPath = path.join(backupDir, fileAnalysis.filePath);
    const backupDir = path.dirname(backupPath);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    fs.copyFileSync(fullPath, backupPath);
    fs.writeFileSync(fullPath, fileAnalysis.newContent);
    return true;
  }
  
  return false;
};

// Générer un rapport des optimisations
const generateReport = (allAnalyses, changedFiles) => {
  const totalImports = allAnalyses.reduce((total, analysis) => total + analysis.imports.length, 0);
  const totalFilesWithLodash = allAnalyses.filter(a => a.imports.length > 0).length;
  const totalFunctionsOptimized = allAnalyses.reduce((total, analysis) => {
    return total + analysis.imports.reduce((sum, imp) => {
      return sum + (imp.functions[0] === 'whole-library' ? 0 : imp.functions.length);
    }, 0);
  }, 0);

  const report = `# Rapport d'Optimisation des Imports Lodash

## Résumé

- **Fichiers analysés**: ${allAnalyses.length}
- **Fichiers utilisant Lodash**: ${totalFilesWithLodash}
- **Imports Lodash trouvés**: ${totalImports}
- **Fonctions optimisées**: ${totalFunctionsOptimized}
- **Fichiers modifiés**: ${changedFiles.length}

## Fonctions Lodash les plus utilisées

${getFunctionUsageReport(allAnalyses)}

## Fichiers modifiés

${changedFiles.map(file => `- \`${file}\``).join('\n')}

## Fichiers nécessitant une attention manuelle

${getManualAttentionFiles(allAnalyses).map(file => `- \`${file}\` (utilise l'import global de lodash)`).join('\n')}

## Impact estimé sur la taille du bundle

L'optimisation des imports Lodash peut réduire la taille du bundle de 40-60 KB (gzippé).

## Comment vérifier ces changements?

Pour vérifier que ces changements n'ont pas cassé la fonctionnalité:
1. Exécutez les tests: \`npm test\`
2. Vérifiez l'application manuellement
3. Assurez-vous que les fonctionnalités critiques fonctionnent toujours

## Comment restaurer l'état précédent?

Tous les fichiers originaux ont été sauvegardés dans le dossier \`${backupDir}\`.
`;

  return report;
};

// Obtenir les statistiques d'utilisation des fonctions Lodash
const getFunctionUsageReport = (allAnalyses) => {
  const functionCounts = {};
  
  allAnalyses.forEach(analysis => {
    analysis.imports.forEach(imp => {
      if (imp.functions[0] !== 'whole-library') {
        imp.functions.forEach(func => {
          functionCounts[func] = (functionCounts[func] || 0) + 1;
        });
      }
    });
  });
  
  const sortedFunctions = Object.entries(functionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  
  if (sortedFunctions.length === 0) {
    return "Aucune fonction Lodash spécifique n'a été trouvée.";
  }
  
  return "```\n" + 
    sortedFunctions.map(([func, count]) => `${func}: ${count} utilisation(s)`).join('\n') + 
    "\n```";
};

// Obtenir la liste des fichiers nécessitant une attention manuelle
const getManualAttentionFiles = (allAnalyses) => {
  return allAnalyses
    .filter(analysis => 
      analysis.imports.some(imp => imp.functions[0] === 'whole-library')
    )
    .map(analysis => analysis.filePath);
};

// Fonction principale
const main = () => {
  try {
    console.log(`Mode: ${dryRun ? 'Simulation (dry-run)' : 'Application des changements'}`);
    
    const files = findTsFiles();
    console.log(`Analyse de ${files.length} fichiers...`);
    
    const allAnalyses = files.map(file => analyzeLodashImports(file));
    const filesWithLodash = allAnalyses.filter(a => a.imports.length > 0);
    
    console.log(`\nFichiers utilisant Lodash: ${filesWithLodash.length}\n`);
    
    if (filesWithLodash.length === 0) {
      console.log('Aucun import Lodash trouvé. Rien à optimiser.');
      return;
    }
    
    const optimizedAnalyses = filesWithLodash.map(analysis => optimizeLodashImports(analysis));
    const changedFiles = [];
    
    optimizedAnalyses.forEach(analysis => {
      if (applyChanges(analysis)) {
        changedFiles.push(analysis.filePath);
      }
    });
    
    console.log(`\n📊 Résumé:`);
    console.log(`- Fichiers analysés: ${files.length}`);
    console.log(`- Fichiers utilisant Lodash: ${filesWithLodash.length}`);
    console.log(`- Fichiers modifiés: ${changedFiles.length}`);
    
    if (!dryRun) {
      const report = generateReport(allAnalyses, changedFiles);
      fs.writeFileSync(reportFile, report);
      console.log(`\n📄 Rapport détaillé sauvegardé dans: ${reportFile}`);
    }
    
    console.log('\n✅ Analyse terminée!');
    
    if (changedFiles.length > 0 && !dryRun) {
      console.log('\n🔍 Vérification des changements:');
      console.log('  - Exécutez les tests pour vérifier que tout fonctionne: npm test');
      console.log('  - Vérifiez manuellement les fonctionnalités critiques de l\'application');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'optimisation des imports:', error);
  }
};

// Exécution du script
main(); 