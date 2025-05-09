#!/usr/bin/env node

/**
 * Script d'aide à la migration des menus de Chakra UI
 * 
 * Ce script cherche toutes les utilisations de Menu de Chakra UI
 * et propose des remplacements en utilisant notre version personnalisée basée sur Radix UI
 * 
 * Usage:
 *   node migrate-chakra-menu.js [file-path]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../../../src');
const REPORT_DIR = path.resolve(__dirname, '../../../reports');

// Créer le répertoire de rapports s'il n'existe pas
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// Expression régulière pour trouver les imports de Menu
const MENU_IMPORT_REGEX = /import\s+\{([^}]*Menu[^}]*)\}\s+from\s+['"]@chakra-ui\/react['"]/;
const MENU_COMPONENTS_REGEX = /Menu|MenuButton|MenuList|MenuItem|MenuGroup|MenuDivider|MenuOptionGroup|MenuItemOption|MenuCommand/g;

// Expression régulière pour trouver les utilisations de Menu
const MENU_USAGE_REGEX = /<Menu([^>]*)>([\s\S]*?)<\/Menu>/g;

/**
 * Analyse un fichier pour identifier l'utilisation des composants Menu
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Vérifier si le fichier importe Menu de Chakra UI
    if (!MENU_IMPORT_REGEX.test(content)) {
      console.log(`⚠️ ${fileName} n'utilise pas Menu de Chakra UI. Aucune suggestion.`);
      return;
    }
    
    console.log(`🔍 Analyse de ${fileName} pour Menu Chakra UI...`);
    
    let report = `# Suggestions de migration pour Menu dans ${fileName}\n\n`;
    
    // Trouver les imports
    const importMatch = content.match(MENU_IMPORT_REGEX);
    if (importMatch) {
      // Extraire les composants importés
      const componentsImported = importMatch[1].split(',').map(comp => comp.trim());
      const menuComponents = componentsImported.filter(comp => comp.match(MENU_COMPONENTS_REGEX));
      
      report += `## Composants de Menu importés\n\n`;
      report += menuComponents.map(comp => `- \`${comp}\``).join('\n') + '\n\n';
      
      report += `## Import original\n\n`;
      report += `\`\`\`jsx\n${importMatch[0]}\n\`\`\`\n\n`;
      
      report += `## Import suggéré\n\n`;
      
      // Faire correspondre les composants Chakra avec les composants Radix
      const componentMap = {
        'Menu': 'Menu',
        'MenuButton': 'MenuTrigger',
        'MenuList': 'MenuContent',
        'MenuItem': 'MenuItem',
        'MenuGroup': 'MenuGroup',
        'MenuDivider': 'MenuSeparator',
        'MenuOptionGroup': 'MenuRadioGroup',
        'MenuItemOption': 'MenuRadioItem', // ou MenuCheckboxItem selon le contexte
        'MenuCommand': 'MenuShortcut'
      };
      
      const mappedComponents = menuComponents.map(comp => componentMap[comp] || comp);
      
      report += `\`\`\`jsx\nimport { ${mappedComponents.join(', ')} } from '@/components/ui/menu';\n\`\`\`\n\n`;
      
      // Indications supplémentaires
      if (menuComponents.includes('MenuItemOption')) {
        report += `> **Note**: \`MenuItemOption\` peut être remplacé par \`MenuRadioItem\` ou \`MenuCheckboxItem\` selon qu'il s'agit d'un groupe radio ou checkbox.\n\n`;
      }
    }
    
    // Trouver les utilisations de Menu
    const examples = [];
    let match;
    while ((match = MENU_USAGE_REGEX.exec(content)) !== null) {
      examples.push({
        original: match[0],
        props: match[1],
        children: match[2]
      });
    }
    
    if (examples.length > 0) {
      report += `## Utilisations trouvées (${examples.length})\n\n`;
      
      examples.forEach((example, index) => {
        report += `### Exemple ${index + 1}\n\n`;
        report += `#### Original\n\n`;
        report += `\`\`\`jsx\n${example.original}\n\`\`\`\n\n`;
        
        // Analyser les props
        const propString = example.props.trim();
        const props = {};
        
        // Extraire les propriétés
        const propMatches = propString.match(/([a-zA-Z0-9]+)(?:=\{([^}]+)\}|="([^"]+)")/g) || [];
        propMatches.forEach(propMatch => {
          const [key, value] = propMatch.split(/=\{|="/).map(p => p.trim());
          props[key] = value ? value.replace(/\}|"/g, '') : true;
        });

        // Suggérer un remplacement
        report += `#### Suggestion\n\n`;
        
        // Remplacer les composants Chakra par Radix
        let suggestion = example.original;
        
        // Remplacer Menu
        suggestion = suggestion.replace(/<Menu/g, '<Menu');
        
        // Remplacer MenuButton
        suggestion = suggestion.replace(/<MenuButton/g, '<MenuTrigger asChild');
        suggestion = suggestion.replace(/<\/MenuButton>/g, '</MenuTrigger>');
        
        // Remplacer MenuList
        suggestion = suggestion.replace(/<MenuList/g, '<MenuContent');
        suggestion = suggestion.replace(/<\/MenuList>/g, '</MenuContent>');
        
        // Remplacer MenuItem
        suggestion = suggestion.replace(/<MenuItem/g, '<MenuItem');
        
        // Remplacer MenuDivider
        suggestion = suggestion.replace(/<MenuDivider/g, '<MenuSeparator');
        suggestion = suggestion.replace(/<MenuDivider \/>/g, '<MenuSeparator />');
        
        // Remplacer MenuGroup
        suggestion = suggestion.replace(/<MenuGroup title="([^"]+)">/g, '<MenuLabel>$1</MenuLabel>\n<MenuGroup>');
        suggestion = suggestion.replace(/<\/MenuGroup>/g, '</MenuGroup>');
        
        // Note sur les transformations avancées qui nécessitent une analyse plus approfondie
        const needsManualReview = suggestion.includes('MenuOptionGroup') || 
                                  suggestion.includes('MenuItemOption') || 
                                  suggestion.includes('closeOnSelect') ||
                                  suggestion.includes('isLazy');
        
        report += `\`\`\`jsx\n${suggestion}\n\`\`\`\n\n`;
        
        if (needsManualReview) {
          report += `> ⚠️ **Attention**: Cet exemple nécessite une révision manuelle plus approfondie. Certains composants comme \`MenuOptionGroup\` et \`MenuItemOption\` peuvent nécessiter une gestion d'état supplémentaire avec Radix UI.\n\n`;
        }
      });
      
      report += `## Notes importantes pour la migration\n\n`;
      report += `- Le bouton de déclenchement du menu doit généralement utiliser \`asChild\` avec \`MenuTrigger\`\n`;
      report += `- Radix UI nécessite une gestion explicite de l'état pour les items cochables\n`;
      report += `- Pour les sous-menus, utilisez les composants \`MenuSub\`, \`MenuSubTrigger\` et \`MenuSubContent\`\n`;
      report += `- Les propriétés comme \`closeOnSelect\` ne sont pas directement disponibles et doivent être gérées via les gestionnaires d'événements\n\n`;
      
      report += `## Ressources supplémentaires\n\n`;
      report += `- Consultez le guide complet: \`src/scripts/performance/menu-migration-guide.md\`\n`;
      report += `- Voir les exemples: \`src/components/examples/RadixMenuExample.jsx\`\n\n`;
    } else {
      report += `Aucune utilisation directe de \`<Menu>\` trouvée dans le fichier malgré l'import. Vérifiez si le composant est peut-être renommé via un alias.\n\n`;
    }
    
    // Écrire le rapport dans un fichier
    const reportFilePath = path.join(REPORT_DIR, `migrate-menu-${fileName}.md`);
    fs.writeFileSync(reportFilePath, report);
    
    console.log(`✅ Rapport de migration Menu généré: ${reportFilePath}`);
    
  } catch (error) {
    console.error(`❌ Erreur lors de l'analyse de ${filePath}:`, error);
  }
}

/**
 * Fonction principale
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Chercher tous les fichiers qui importent Menu de Chakra UI
    try {
      console.log('🔍 Recherche de fichiers utilisant Menu de Chakra UI...');
      
      const grepCommand = `grep -r "import.*Menu.*from '@chakra-ui/react'" ${SRC_DIR} --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"`;
      const grepResult = execSync(grepCommand, { encoding: 'utf8' });
      
      const files = grepResult.split('\n').filter(Boolean).map(line => {
        const [filePath] = line.split(':');
        return filePath;
      });
      
      if (files.length === 0) {
        console.log('⚠️ Aucun fichier utilisant Menu de Chakra UI trouvé.');
        return;
      }
      
      console.log(`📁 ${files.length} fichiers identifiés avec des imports Menu de Chakra UI`);
      
      files.forEach(file => {
        analyzeFile(file);
      });
      
      console.log(`✅ Migration terminée. Consultez les rapports dans le répertoire ${REPORT_DIR}`);
      
    } catch (error) {
      // Si grep ne trouve rien, il renvoie une erreur
      console.log('⚠️ Aucun fichier utilisant Menu de Chakra UI trouvé.');
    }
  } else {
    // Analyser un fichier spécifique
    const filePath = path.resolve(args[0]);
    analyzeFile(filePath);
  }
}

main(); 