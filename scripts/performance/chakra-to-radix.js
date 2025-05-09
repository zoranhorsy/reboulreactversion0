#!/usr/bin/env node

/**
 * Script d'aide à la migration de Chakra UI vers Radix UI + Tailwind CSS
 * 
 * Ce script:
 * 1. Analyse les fichiers du projet pour identifier l'utilisation de Chakra UI
 * 2. Propose des remplacements pour les composants courants
 * 3. Génère des suggestions de code pour la migration
 * 
 * Usage:
 *   node chakra-to-radix.js [file-path]
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

// Mappings des composants Chakra UI vers Radix UI + Tailwind
const componentMappings = {
  'Button': {
    import: "import { Button } from '@/components/ui/button';",
    transform: (props) => {
      let variant = 'default';
      let size = 'default';
      let className = '';
      
      // Mapper les propriétés
      if (props.includes('colorScheme="red"')) variant = 'destructive';
      if (props.includes('variant="outline"')) variant = 'outline';
      if (props.includes('variant="ghost"')) variant = 'ghost';
      if (props.includes('variant="link"')) variant = 'link';
      if (props.includes('size="sm"')) size = 'sm';
      if (props.includes('size="lg"')) size = 'lg';
      if (props.includes('width="full"') || props.includes('w="full"')) className += ' w-full';
      if (props.includes('leftIcon=') || props.includes('rightIcon=')) className += ' flex items-center gap-2';
      
      return `<Button variant="${variant}" size="${size}"${className ? ` className="${className.trim()}"` : ''}>`;
    },
    notes: "Les icônes doivent être ajoutées directement comme enfants plutôt qu'avec leftIcon/rightIcon"
  },
  'Box': {
    import: null, // Pas d'import nécessaire pour les éléments HTML
    transform: (props) => {
      let className = 'p-4';
      
      if (props.includes('shadow')) className += ' shadow-md';
      if (props.includes('borderWidth') || props.includes('border=')) className += ' border border-gray-200';
      if (props.includes('borderRadius') || props.includes('rounded')) className += ' rounded-md';
      if (props.includes('bg="white"')) className += ' bg-white';
      if (props.includes('p={')) {
        // Extraire la valeur de p={X}
        const pMatch = props.match(/p=\{(\d+)\}/);
        if (pMatch && pMatch[1]) {
          const pValue = parseInt(pMatch[1]);
          className = className.replace('p-4', `p-${pValue}`);
        }
      }
      if (props.includes('mt={')) {
        const mtMatch = props.match(/mt=\{(\d+)\}/);
        if (mtMatch && mtMatch[1]) {
          const mtValue = parseInt(mtMatch[1]);
          className += ` mt-${mtValue}`;
        }
      }
      
      return `<div className="${className}">`;
    },
    notes: "Les propriétés de style doivent être converties en classes Tailwind"
  },
  'Flex': {
    import: null,
    transform: (props) => {
      let className = 'flex';
      
      if (props.includes('direction="column"')) className += ' flex-col';
      if (props.includes('align="center"')) className += ' items-center';
      if (props.includes('justify="center"')) className += ' justify-center';
      if (props.includes('justify="space-between"')) className += ' justify-between';
      if (props.includes('gap=')) {
        const gapMatch = props.match(/gap=\{(\d+)\}/);
        if (gapMatch && gapMatch[1]) {
          const gapValue = parseInt(gapMatch[1]);
          className += ` gap-${gapValue}`;
        }
      }
      
      return `<div className="${className}">`;
    },
    notes: "Les propriétés Flex doivent être converties en classes Tailwind flex-*"
  },
  'Input': {
    import: "import { Input } from '@/components/ui/input';",
    transform: (props) => {
      let className = '';
      
      if (props.includes('isDisabled')) return '<Input disabled />';
      if (props.includes('size="lg"')) className += ' text-lg py-6';
      if (props.includes('size="sm"')) className += ' text-sm py-1';
      
      return `<Input${className ? ` className="${className.trim()}"` : ''} />`;
    },
    notes: "Les variations de taille peuvent nécessiter des classes personnalisées"
  },
  'Modal': {
    import: "import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';",
    transform: (props) => {
      return `<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Titre</DialogTitle>
    </DialogHeader>
    <DialogDescription>
      Contenu
    </DialogDescription>
    <DialogFooter>
      <Button onClick={onClose}>Fermer</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`;
    },
    notes: "La structure complète du Modal doit être remplacée"
  },
  // Ajouter d'autres composants selon les besoins
};

/**
 * Analyse un fichier pour identifier l'utilisation de Chakra UI
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    let report = `# Suggestions de migration pour ${fileName}\n\n`;
    
    // Vérifier si le fichier importe Chakra UI
    if (!content.includes('@chakra-ui/react')) {
      console.log(`⚠️ ${fileName} n'utilise pas Chakra UI. Aucune suggestion.`);
      return;
    }
    
    console.log(`🔍 Analyse de ${fileName}...`);
    
    // Trouver les imports Chakra UI
    const importMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]@chakra-ui\/react['"]/);
    if (!importMatch) return;
    
    const components = importMatch[1].split(',').map(c => c.trim());
    
    report += `## Imports identifiés\n\n`;
    report += `\`\`\`jsx\n${importMatch[0]}\n\`\`\`\n\n`;
    
    // Générer des suggestions pour chaque composant
    report += `## Suggestions de remplacement\n\n`;
    
    const newImports = new Set();
    
    components.forEach(comp => {
      const componentName = comp.split(' as ')[0].trim();
      const mapping = componentMappings[componentName];
      
      if (mapping) {
        report += `### ${componentName}\n\n`;
        
        // Trouver les utilisations du composant
        const componentRegex = new RegExp(`<${componentName}\\s+([^>]*)`, 'g');
        let match;
        const examples = [];
        
        while ((match = componentRegex.exec(content)) !== null) {
          if (match[1]) {
            examples.push(match[0]);
          }
        }
        
        if (examples.length > 0) {
          report += `#### Exemples trouvés:\n\n`;
          
          examples.slice(0, 3).forEach((example, index) => {
            report += `**Exemple ${index + 1}:**\n\n`;
            report += `\`\`\`jsx\n${example}>\n\`\`\`\n\n`;
            
            // Générer une suggestion de remplacement
            report += `**Suggestion:**\n\n`;
            report += `\`\`\`jsx\n${mapping.transform(example)}>\n\`\`\`\n\n`;
          });
          
          if (mapping.notes) {
            report += `**Notes:**\n\n`;
            report += `${mapping.notes}\n\n`;
          }
        } else {
          report += `Aucune utilisation trouvée dans le fichier.\n\n`;
        }
        
        // Ajouter le nouvel import à la liste
        if (mapping.import) {
          newImports.add(mapping.import);
        }
      } else {
        report += `### ${componentName}\n\n`;
        report += `Pas de suggestion automatique disponible pour ce composant.\n\n`;
      }
    });
    
    // Suggérer les nouveaux imports
    if (newImports.size > 0) {
      report += `## Nouveaux imports suggérés\n\n`;
      report += `\`\`\`jsx\n${Array.from(newImports).join('\n')}\n\`\`\`\n\n`;
    }
    
    // Générer un aperçu du fichier migré
    report += `## Aperçu du code migré\n\n`;
    report += `Ce code est une suggestion approximative et nécessitera probablement des ajustements manuels.\n\n`;
    
    let migratedCode = content;
    
    // Remplacer l'import Chakra UI
    migratedCode = migratedCode.replace(
      /import\s+\{[^}]+\}\s+from\s+['"]@chakra-ui\/react['"];?/,
      Array.from(newImports).join('\n')
    );
    
    // Remplacer les composants
    components.forEach(comp => {
      const componentName = comp.split(' as ')[0].trim();
      const mapping = componentMappings[componentName];
      
      if (mapping) {
        // Cas simple pour l'exemple - un remplacement réel nécessiterait un parseur AST
        const regex = new RegExp(`<${componentName}\\s+([^>]*)>`, 'g');
        migratedCode = migratedCode.replace(regex, (match, props) => {
          return mapping.transform(match);
        });
        
        // Fermeture des balises
        migratedCode = migratedCode.replace(
          new RegExp(`</${componentName}>`, 'g'),
          componentName === 'Box' || componentName === 'Flex' ? '</div>' : `</${componentName === 'Modal' ? 'Dialog' : componentName}>`
        );
      }
    });
    
    report += `\`\`\`jsx\n${migratedCode}\n\`\`\`\n\n`;
    
    // Écrire le rapport dans un fichier
    const reportFilePath = path.join(REPORT_DIR, `migration-${fileName}.md`);
    fs.writeFileSync(reportFilePath, report);
    
    console.log(`✅ Rapport de migration généré: ${reportFilePath}`);
    
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
    // Analyser tous les fichiers qui importent Chakra UI
    try {
      console.log('🔍 Recherche de fichiers utilisant Chakra UI...');
      
      const grepCommand = `grep -r "from '@chakra-ui/react'" ${SRC_DIR} --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"`;
      const grepResult = execSync(grepCommand, { encoding: 'utf8' });
      
      const files = grepResult.split('\n').filter(Boolean).map(line => {
        const [filePath] = line.split(':');
        return filePath;
      });
      
      console.log(`📁 ${files.length} fichiers identifiés avec des imports Chakra UI`);
      
      // Limiter à 10 fichiers pour éviter la surcharge
      const filesToProcess = files.slice(0, 10);
      console.log(`🔄 Traitement des 10 premiers fichiers...`);
      
      filesToProcess.forEach(file => {
        analyzeFile(file);
      });
      
      console.log(`✅ Migration terminée. Consultez les rapports dans le répertoire ${REPORT_DIR}`);
      
    } catch (error) {
      console.error('❌ Erreur lors de la recherche des fichiers:', error.message);
    }
  } else {
    // Analyser un fichier spécifique
    const filePath = path.resolve(args[0]);
    analyzeFile(filePath);
  }
}

main(); 