#!/usr/bin/env node

/**
 * Script pour identifier et remplacer les animations framer-motion
 * par notre bibliothèque d'animations CSS optimisée
 * 
 * Ce script analyse les composants React qui utilisent framer-motion
 * et propose des remplacements par notre bibliothèque d'animations CSS
 * pour réduire significativement la taille du bundle JavaScript.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const srcDir = path.join(process.cwd(), 'src');
const reportFile = path.join(process.cwd(), 'reports', 'framer-motion-replacements.md');
const dryRun = process.argv.includes('--dry-run');
const verbose = process.argv.includes('--verbose');

// Assurez-vous que le dossier de rapports existe
if (!fs.existsSync(path.dirname(reportFile))) {
  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
}

console.log('🔍 Analyse des utilisations de framer-motion...\n');

// Définir les animations framer-motion courantes et leurs équivalents CSS
const animationMappings = [
  {
    name: 'fade',
    framerMotionPattern: /animate={{ opacity: [01] }}/,
    cssReplacement: 'animate-fade-in',
    complexityLevel: 'simple'
  },
  {
    name: 'scale',
    framerMotionPattern: /animate={{ scale: [\d.]+ }}/,
    cssReplacement: 'animate-scale-in',
    complexityLevel: 'simple'
  },
  {
    name: 'slide-in-right',
    framerMotionPattern: /animate={{ x: \[.*\] }}|initial={{ x: .*? }}.*animate={{ x: 0 }}/,
    cssReplacement: 'animate-slide-in-right',
    complexityLevel: 'simple'
  },
  {
    name: 'slide-in-left',
    framerMotionPattern: /animate={{ x: \[.*\] }}|initial={{ x: .*? }}.*animate={{ x: 0 }}/,
    cssReplacement: 'animate-slide-in-left',
    complexityLevel: 'simple'
  },
  {
    name: 'slide-in-top',
    framerMotionPattern: /animate={{ y: \[.*\] }}|initial={{ y: .*? }}.*animate={{ y: 0 }}/,
    cssReplacement: 'animate-slide-in-top',
    complexityLevel: 'simple'
  },
  {
    name: 'slide-in-bottom',
    framerMotionPattern: /animate={{ y: \[.*\] }}|initial={{ y: .*? }}.*animate={{ y: 0 }}/,
    cssReplacement: 'animate-slide-in-bottom',
    complexityLevel: 'simple'
  },
  {
    name: 'complex-animation',
    framerMotionPattern: /variants=|\<AnimatePresence\>|drag|whileHover|whileTap/,
    cssReplacement: null, // Nécessite une analyse manuelle
    complexityLevel: 'complex'
  }
];

// Trouver tous les fichiers React/TypeScript dans src
const findReactFiles = () => {
  return glob.sync('**/*.{tsx,jsx}', {
    cwd: srcDir,
    ignore: ['**/node_modules/**']
  });
};

// Analyser un fichier pour les utilisations de framer-motion
const analyzeFramerMotionUsage = (filePath) => {
  const fullPath = path.join(srcDir, filePath);
  const fileContent = fs.readFileSync(fullPath, 'utf8');
  const result = {
    filePath,
    usesFramerMotion: false,
    imports: [],
    motionComponents: [],
    animations: []
  };

  // Vérifier si le fichier importe framer-motion
  const importMatch = fileContent.match(/import.*from ['"]framer-motion['"]/g);
  if (importMatch) {
    result.usesFramerMotion = true;
    result.imports = importMatch;

    // Rechercher les composants motion
    const motionComponentMatches = fileContent.match(/<motion\.[a-zA-Z]+/g);
    if (motionComponentMatches) {
      result.motionComponents = motionComponentMatches.map(match => match.replace('<', ''));
    }

    // Rechercher les animations spécifiques
    animationMappings.forEach(mapping => {
      if (fileContent.match(mapping.framerMotionPattern)) {
        result.animations.push({
          name: mapping.name,
          complexityLevel: mapping.complexityLevel,
          cssReplacement: mapping.cssReplacement
        });
      }
    });
  }

  return result;
};

// Générer un rapport des remplacements possibles
const generateReport = (allAnalyses) => {
  const filesUsingFramerMotion = allAnalyses.filter(a => a.usesFramerMotion);
  const totalAnimations = filesUsingFramerMotion.reduce(
    (total, file) => total + file.animations.length, 0
  );
  const simpleAnimations = filesUsingFramerMotion.reduce(
    (total, file) => total + file.animations.filter(a => a.complexityLevel === 'simple').length, 0
  );
  const complexAnimations = totalAnimations - simpleAnimations;

  const report = `# Rapport de Remplacement des Animations framer-motion

## Résumé

- **Fichiers analysés**: ${allAnalyses.length}
- **Fichiers utilisant framer-motion**: ${filesUsingFramerMotion.length}
- **Animations identifiées**: ${totalAnimations}
  - Animations simples (remplaçables par CSS): ${simpleAnimations}
  - Animations complexes (nécessitant analyse manuelle): ${complexAnimations}

## Remplacements recommandés

${generateReplacementRecommendations(filesUsingFramerMotion)}

## Impact estimé sur la taille du bundle

Le remplacement des animations framer-motion simples par notre bibliothèque CSS pourrait réduire 
la taille du bundle de ~25KB gzippé. Le remplacement complet de framer-motion pourrait 
économiser jusqu'à ~40KB gzippé.

## Étapes recommandées

1. Commencer par remplacer les animations simples identifiées
2. Tester chaque modification
3. Analyser manuellement les animations complexes
4. Pour les animations complexes, considérer:
   - Remplacement direct par notre bibliothèque CSS
   - Utilisation d'une bibliothèque plus légère comme AnimeJS
   - Création d'animations CSS personnalisées
   - Conservation de framer-motion uniquement pour les cas très complexes avec chargement dynamique

## Comment utiliser notre bibliothèque d'animations CSS

Exemple de remplacement:

\`\`\`jsx
// Avant avec framer-motion
import { motion } from 'framer-motion';

function Component() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      Contenu
    </motion.div>
  );
}

// Après avec notre bibliothèque CSS
function Component() {
  return (
    <div className="animate-fade-in duration-slow">
      Contenu
    </div>
  );
}
\`\`\`

Pour les cas plus complexes, utilisez notre composant OptimizedAnimatedBox:

\`\`\`jsx
import OptimizedAnimatedBox from '@/components/ui/OptimizedAnimatedBox';

function Component() {
  return (
    <OptimizedAnimatedBox
      animation="fadeIn"
      duration="slow"
      easing="out"
      delay={300}
    >
      Contenu
    </OptimizedAnimatedBox>
  );
}
\`\`\`
`;

  return report;
};

// Générer des recommandations de remplacement
const generateReplacementRecommendations = (filesUsingFramerMotion) => {
  const recommendations = filesUsingFramerMotion
    .filter(file => file.animations.length > 0)
    .map(file => {
      const simpleAnimations = file.animations.filter(a => a.complexityLevel === 'simple');
      const complexAnimations = file.animations.filter(a => a.complexityLevel === 'complex');
      
      return `### ${file.filePath}

- **Imports framer-motion**: ${file.imports.length > 0 ? '\n  ```jsx\n  ' + file.imports.join('\n  ') + '\n  ```' : 'Aucun'}
- **Composants motion utilisés**: ${file.motionComponents.length > 0 ? file.motionComponents.join(', ') : 'Aucun'}
${simpleAnimations.length > 0 ? `
- **Animations simples remplaçables**:
  ${simpleAnimations.map(a => `- ${a.name} → remplacer par '${a.cssReplacement}'`).join('\n  ')}
` : ''}
${complexAnimations.length > 0 ? `
- **Animations complexes** (analyse manuelle requise):
  ${complexAnimations.map(a => `- ${a.name}`).join('\n  ')}
` : ''}
${generateReplacementExample(file)}
`;
    })
    .join('\n\n');
    
  return recommendations || 'Aucun remplacement recommandé';
};

// Générer un exemple de remplacement pour un fichier
const generateReplacementExample = (fileAnalysis) => {
  if (fileAnalysis.animations.length === 0 || fileAnalysis.motionComponents.length === 0) {
    return '';
  }
  
  const simpleAnimations = fileAnalysis.animations.filter(a => a.complexityLevel === 'simple');
  if (simpleAnimations.length === 0) {
    return '- **Exemple**: Animation complexe, analyse manuelle requise';
  }
  
  const motionComponent = fileAnalysis.motionComponents[0];
  const animation = simpleAnimations[0];
  
  return `- **Exemple de remplacement**:
  ```jsx
  // Avant
  <${motionComponent} animate={{ /* propriétés */ }}>Contenu</${motionComponent.split(' ')[0]}>
  
  // Après
  <div className="${animation.cssReplacement}">Contenu</div>
  
  // Ou avec notre composant optimisé
  <OptimizedAnimatedBox animation="${animation.name.replace('slide-in-', '')}">
    Contenu
  </OptimizedAnimatedBox>
  ````;
};

// Fonction principale
const main = () => {
  try {
    const files = findReactFiles();
    console.log(`Analyse de ${files.length} fichiers React...`);
    
    const allAnalyses = files.map(file => analyzeFramerMotionUsage(file));
    const filesUsingFramerMotion = allAnalyses.filter(a => a.usesFramerMotion);
    
    console.log(`\nFichiers utilisant framer-motion: ${filesUsingFramerMotion.length}`);
    
    if (filesUsingFramerMotion.length === 0) {
      console.log('Aucune utilisation de framer-motion trouvée.');
      return;
    }
    
    // Afficher un résumé des analyses
    const totalAnimations = filesUsingFramerMotion.reduce(
      (total, file) => total + file.animations.length, 0
    );
    const simpleAnimations = filesUsingFramerMotion.reduce(
      (total, file) => total + file.animations.filter(a => a.complexityLevel === 'simple').length, 0
    );
    const complexAnimations = totalAnimations - simpleAnimations;
    
    console.log('\n📊 Résumé:');
    console.log(`- Animations identifiées: ${totalAnimations}`);
    console.log(`  - Simples (remplaçables par CSS): ${simpleAnimations}`);
    console.log(`  - Complexes (analyse manuelle): ${complexAnimations}`);
    
    if (verbose) {
      console.log('\nDétails par fichier:');
      filesUsingFramerMotion.forEach(file => {
        console.log(`\n📁 ${file.filePath}`);
        console.log(`  - Composants motion: ${file.motionComponents.length > 0 ? file.motionComponents.join(', ') : 'Aucun'}`);
        console.log(`  - Animations: ${file.animations.length > 0 ? file.animations.map(a => a.name).join(', ') : 'Aucune'}`);
      });
    }
    
    // Générer et enregistrer le rapport
    const report = generateReport(allAnalyses);
    fs.writeFileSync(reportFile, report);
    
    console.log(`\n📄 Rapport détaillé sauvegardé dans: ${reportFile}`);
    console.log('\n✅ Analyse terminée!');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
  }
};

// Exécution du script
main(); 