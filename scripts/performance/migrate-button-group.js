#!/usr/bin/env node

/**
 * Script d'aide à la migration des ButtonGroup de Chakra UI
 * 
 * Ce script cherche toutes les utilisations de ButtonGroup de Chakra UI
 * et propose des remplacements en utilisant notre version personnalisée
 * 
 * Usage:
 *   node migrate-button-group.js [file-path]
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

// Expression régulière pour trouver les ButtonGroup
const BUTTON_GROUP_IMPORT_REGEX = /import\s+\{([^}]*ButtonGroup[^}]*)\}\s+from\s+['"]@chakra-ui\/react['"]/;
const BUTTON_GROUP_USAGE_REGEX = /<ButtonGroup([^>]*)>([\s\S]*?)<\/ButtonGroup>/g;

/**
 * Analyse un fichier pour identifier l'utilisation de ButtonGroup
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Vérifier si le fichier importe ButtonGroup de Chakra UI
    if (!BUTTON_GROUP_IMPORT_REGEX.test(content)) {
      console.log(`⚠️ ${fileName} n'utilise pas ButtonGroup de Chakra UI. Aucune suggestion.`);
      return;
    }
    
    console.log(`🔍 Analyse de ${fileName} pour ButtonGroup...`);
    
    let report = `# Suggestions de migration pour ButtonGroup dans ${fileName}\n\n`;
    
    // Trouver les imports
    const importMatch = content.match(BUTTON_GROUP_IMPORT_REGEX);
    if (importMatch) {
      report += `## Import original\n\n`;
      report += `\`\`\`jsx\n${importMatch[0]}\n\`\`\`\n\n`;
      
      report += `## Import suggéré\n\n`;
      report += `\`\`\`jsx\nimport { ButtonGroup } from '@/components/ui/button-group';\n\`\`\`\n\n`;
    }
    
    // Trouver les utilisations de ButtonGroup
    const examples = [];
    let match;
    while ((match = BUTTON_GROUP_USAGE_REGEX.exec(content)) !== null) {
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
        
        // Générer la suggestion
        let newProps = [];
        
        // Conserver spacing
        if (props.spacing) {
          newProps.push(`spacing={${props.spacing}}`);
        }
        
        // Convertir direction si présent
        if (props.direction) {
          newProps.push(`direction="${props.direction}"`);
        }
        
        // Convertir variant si présent
        if (props.variant) {
          newProps.push(`variant="${props.variant}"`);
        }
        
        // Convertir isAttached si présent
        if (props.isAttached) {
          newProps.push(`isAttached`);
        }
        
        // Transformer les propriétés de style en className
        const tailwindClasses = [];
        
        if (props.mt) tailwindClasses.push(`mt-${props.mt}`);
        if (props.mb) tailwindClasses.push(`mb-${props.mb}`);
        if (props.ml) tailwindClasses.push(`ml-${props.ml}`);
        if (props.mr) tailwindClasses.push(`mr-${props.mr}`);
        if (props.m) tailwindClasses.push(`m-${props.m}`);
        if (props.p) tailwindClasses.push(`p-${props.p}`);
        if (props.pt) tailwindClasses.push(`pt-${props.pt}`);
        if (props.pb) tailwindClasses.push(`pb-${props.pb}`);
        if (props.pl) tailwindClasses.push(`pl-${props.pl}`);
        if (props.pr) tailwindClasses.push(`pr-${props.pr}`);
        
        if (tailwindClasses.length > 0) {
          newProps.push(`className="${tailwindClasses.join(' ')}"`);
        }
        
        // Préserver les autres propriétés non spécifiques à Chakra
        Object.keys(props).forEach(key => {
          // Ignorer les propriétés déjà traitées ou spécifiques à Chakra
          if ([
            'spacing', 'direction', 'variant', 'isAttached', 
            'mt', 'mb', 'ml', 'mr', 'm', 'p', 'pt', 'pb', 'pl', 'pr', 
            'size', 'colorScheme', 'width', 'height'
          ].includes(key)) {
            return;
          }
          
          // Conserver les autres propriétés standard
          // Si c'est une chaîne, ajouter des guillemets
          if (typeof props[key] === 'string') {
            newProps.push(`${key}="${props[key]}"`);
          } 
          // Si c'est une expression, ajouter des accolades
          else if (props[key] !== true) {
            newProps.push(`${key}={${props[key]}}`);
          } 
          // Si c'est un booléen true, ajouter juste le nom
          else {
            newProps.push(key);
          }
        });
        
        const suggestedJSX = `<ButtonGroup ${newProps.join(' ')}>${example.children}</ButtonGroup>`;
        
        report += `#### Suggestion\n\n`;
        report += `\`\`\`jsx\n${suggestedJSX}\n\`\`\`\n\n`;
      });
      
      report += `## Notes importantes\n\n`;
      report += `- Assurez-vous d'importer \`ButtonGroup\` depuis \`@/components/ui/button-group\`\n`;
      report += `- Les boutons à l'intérieur doivent utiliser la version Radix UI de Button\n`;
      report += `- Pour les icônes, utilisez la structure \`<Button size="icon">...</Button>\` au lieu de \`IconButton\`\n\n`;
      
      // Prévisualisation globale des changements
      report += `## Prévisualisation des changements globaux\n\n`;
      
      let migratedContent = content;
      
      // Remplacer l'import
      migratedContent = migratedContent.replace(
        BUTTON_GROUP_IMPORT_REGEX,
        (match) => {
          // Conserver uniquement les autres composants importés
          const components = importMatch[1].split(',')
            .map(c => c.trim())
            .filter(c => c !== 'ButtonGroup');
          
          if (components.length === 0) {
            // S'il n'y a que ButtonGroup, remplacer l'import complet
            return `import { ButtonGroup } from '@/components/ui/button-group';`;
          } else {
            // Sinon, conserver les autres composants et ajouter un import séparé
            return `import { ${components.join(', ')} } from '@chakra-ui/react';\nimport { ButtonGroup } from '@/components/ui/button-group';`;
          }
        }
      );
      
      // Remplacer chaque ButtonGroup
      examples.forEach(example => {
        // Analyser les props
        const propString = example.props.trim();
        const props = {};
        
        // Extraire les propriétés
        const propMatches = propString.match(/([a-zA-Z0-9]+)(?:=\{([^}]+)\}|="([^"]+)")/g) || [];
        propMatches.forEach(propMatch => {
          const [key, value] = propMatch.split(/=\{|="/).map(p => p.trim());
          props[key] = value ? value.replace(/\}|"/g, '') : true;
        });
        
        // Générer la suggestion
        let newProps = [];
        
        // Conserver spacing
        if (props.spacing) {
          newProps.push(`spacing={${props.spacing}}`);
        }
        
        // Convertir direction si présent
        if (props.direction) {
          newProps.push(`direction="${props.direction}"`);
        }
        
        // Convertir variant si présent
        if (props.variant) {
          newProps.push(`variant="${props.variant}"`);
        }
        
        // Convertir isAttached si présent
        if (props.isAttached) {
          newProps.push(`isAttached`);
        }
        
        // Transformer les propriétés de style en className
        const tailwindClasses = [];
        
        if (props.mt) tailwindClasses.push(`mt-${props.mt}`);
        if (props.mb) tailwindClasses.push(`mb-${props.mb}`);
        if (props.ml) tailwindClasses.push(`ml-${props.ml}`);
        if (props.mr) tailwindClasses.push(`mr-${props.mr}`);
        if (props.m) tailwindClasses.push(`m-${props.m}`);
        if (props.p) tailwindClasses.push(`p-${props.p}`);
        if (props.pt) tailwindClasses.push(`pt-${props.pt}`);
        if (props.pb) tailwindClasses.push(`pb-${props.pb}`);
        if (props.pl) tailwindClasses.push(`pl-${props.pl}`);
        if (props.pr) tailwindClasses.push(`pr-${props.pr}`);
        
        if (tailwindClasses.length > 0) {
          newProps.push(`className="${tailwindClasses.join(' ')}"`);
        }
        
        // Préserver les autres propriétés non spécifiques à Chakra
        Object.keys(props).forEach(key => {
          // Ignorer les propriétés déjà traitées ou spécifiques à Chakra
          if ([
            'spacing', 'direction', 'variant', 'isAttached', 
            'mt', 'mb', 'ml', 'mr', 'm', 'p', 'pt', 'pb', 'pl', 'pr', 
            'size', 'colorScheme', 'width', 'height'
          ].includes(key)) {
            return;
          }
          
          // Conserver les autres propriétés standard
          // Si c'est une chaîne, ajouter des guillemets
          if (typeof props[key] === 'string') {
            newProps.push(`${key}="${props[key]}"`);
          } 
          // Si c'est une expression, ajouter des accolades
          else if (props[key] !== true) {
            newProps.push(`${key}={${props[key]}}`);
          } 
          // Si c'est un booléen true, ajouter juste le nom
          else {
            newProps.push(key);
          }
        });
        
        const suggestedJSX = `<ButtonGroup ${newProps.join(' ')}>${example.children}</ButtonGroup>`;
        
        // Remplacer dans le contenu
        migratedContent = migratedContent.replace(example.original, suggestedJSX);
      });
      
      report += `### Aperçu du fichier migré\n\n`;
      report += `\`\`\`jsx\n${migratedContent}\n\`\`\`\n\n`;
    } else {
      report += `Aucune utilisation de ButtonGroup trouvée dans le fichier malgré l'import. Vérifiez si le composant est peut-être renommé via un alias.\n\n`;
    }
    
    // Écrire le rapport dans un fichier
    const reportFilePath = path.join(REPORT_DIR, `migrate-buttongroup-${fileName}.md`);
    fs.writeFileSync(reportFilePath, report);
    
    console.log(`✅ Rapport de migration ButtonGroup généré: ${reportFilePath}`);
    
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
    // Chercher tous les fichiers qui importent ButtonGroup de Chakra UI
    try {
      console.log('🔍 Recherche de fichiers utilisant ButtonGroup de Chakra UI...');
      
      const grepCommand = `grep -r "ButtonGroup.*from '@chakra-ui/react'" ${SRC_DIR} --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"`;
      const grepResult = execSync(grepCommand, { encoding: 'utf8' });
      
      const files = grepResult.split('\n').filter(Boolean).map(line => {
        const [filePath] = line.split(':');
        return filePath;
      });
      
      if (files.length === 0) {
        console.log('⚠️ Aucun fichier utilisant ButtonGroup de Chakra UI trouvé.');
        return;
      }
      
      console.log(`📁 ${files.length} fichiers identifiés avec des imports ButtonGroup de Chakra UI`);
      
      files.forEach(file => {
        analyzeFile(file);
      });
      
      console.log(`✅ Migration terminée. Consultez les rapports dans le répertoire ${REPORT_DIR}`);
      
    } catch (error) {
      // Si grep ne trouve rien, il renvoie une erreur
      console.log('⚠️ Aucun fichier utilisant ButtonGroup de Chakra UI trouvé.');
    }
  } else {
    // Analyser un fichier spécifique
    const filePath = path.resolve(args[0]);
    analyzeFile(filePath);
  }
}

main(); 