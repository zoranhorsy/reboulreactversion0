#!/usr/bin/env node

/**
 * Script d'analyse de l'utilisation des composants Chakra UI
 * 
 * Ce script parcourt les fichiers du projet et:
 * 1. Identifie les imports Chakra UI
 * 2. Compte les occurrences de chaque composant
 * 3. Analyse les patterns d'utilisation courants
 * 4. Génère un rapport pour faciliter la migration vers Radix UI + Tailwind
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const util = require('util');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../../../src');
const REPORT_FILE = path.resolve(__dirname, '../../../reports/chakra-usage-report.md');

// Structure de données pour suivre l'utilisation
const usageData = {
  componentCounts: {},
  fileUsage: {},
  importPatterns: {},
  propUsage: {},
  themeOverrides: [],
};

// Regex pour détecter les imports Chakra
const CHAKRA_IMPORT_REGEX = /import\s+\{([^}]+)\}\s+from\s+['"]@chakra-ui\/react['"]/g;
const COMPONENT_USAGE_REGEX = /<([A-Z][a-zA-Z0-9]*)(\s+[^>]*)?>/g;
const PROP_PATTERN_REGEX = /([a-zA-Z0-9]+)=\{?["']?([^"'\s}]+)["']?\}?/g;

/**
 * Analyse tous les fichiers JS/TS/JSX/TSX du projet
 */
function analyzeProject() {
  console.log('🔍 Analyse du projet en cours...');
  
  try {
    // Trouver tous les fichiers qui importent Chakra UI
    const grepCommand = `grep -r "from '@chakra-ui/react'" ${SRC_DIR} --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"`;
    const grepResult = execSync(grepCommand, { encoding: 'utf8' });
    
    // Traiter les résultats
    const files = grepResult.split('\n').filter(Boolean).map(line => {
      const [filePath] = line.split(':');
      return filePath;
    });
    
    console.log(`📁 ${files.length} fichiers identifiés avec des imports Chakra UI`);
    
    // Analyser chaque fichier
    files.forEach(filePath => {
      analyzeFile(filePath);
    });
    
    // Générer le rapport
    generateReport();
    
    console.log(`✅ Analyse terminée. Rapport généré: ${REPORT_FILE}`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
  }
}

/**
 * Analyse un fichier spécifique pour les composants Chakra UI
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Extraire les imports Chakra UI
    let match;
    while ((match = CHAKRA_IMPORT_REGEX.exec(content)) !== null) {
      const importString = match[1];
      const components = importString.split(',').map(c => c.trim());
      
      components.forEach(component => {
        // Nettoyer le nom du composant (gestion des alias)
        const cleanComponent = component.split(' as ')[0].trim();
        if (!cleanComponent) return;
        
        // Incrémenter le compteur
        usageData.componentCounts[cleanComponent] = (usageData.componentCounts[cleanComponent] || 0) + 1;
        
        // Enregistrer l'utilisation par fichier
        if (!usageData.fileUsage[fileName]) {
          usageData.fileUsage[fileName] = new Set();
        }
        usageData.fileUsage[fileName].add(cleanComponent);
      });
    }
    
    // Analyser l'utilisation des composants dans le fichier
    analyzeComponentUsage(content, fileName);
    
  } catch (error) {
    console.error(`Erreur lors de l'analyse du fichier ${filePath}:`, error.message);
  }
}

/**
 * Analyse l'utilisation des composants dans le contenu du fichier
 */
function analyzeComponentUsage(content, fileName) {
  const componentNames = Object.keys(usageData.componentCounts);
  
  componentNames.forEach(component => {
    // Rechercher les utilisations du composant
    const componentRegex = new RegExp(`<${component}(\\s+[^>]*)?>`);
    if (componentRegex.test(content)) {
      // Extraire les modèles de propriétés
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (componentRegex.test(line)) {
          // Extraire les propriétés du composant
          let propMatch;
          const propPattern = new RegExp(`<${component}\\s+([^>]*)`, 'g');
          while ((propMatch = propPattern.exec(line)) !== null) {
            if (propMatch[1]) {
              const props = propMatch[1].trim();
              
              // Enregistrer le modèle d'utilisation
              if (!usageData.propUsage[component]) {
                usageData.propUsage[component] = [];
              }
              
              if (props && !usageData.propUsage[component].includes(props)) {
                usageData.propUsage[component].push(props);
              }
              
              // Rechercher les propriétés de style et thème
              if (props.includes('colorScheme') || 
                  props.includes('variant') || 
                  props.includes('size')) {
                if (!usageData.themeOverrides.includes(`${component} (${fileName})`)) {
                  usageData.themeOverrides.push(`${component} (${fileName})`);
                }
              }
            }
          }
        }
      }
    }
  });
}

/**
 * Génère un rapport basé sur les données collectées
 */
function generateReport() {
  // Créer le répertoire des rapports s'il n'existe pas
  const reportsDir = path.dirname(REPORT_FILE);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Trier les composants par nombre d'occurrences
  const sortedComponents = Object.entries(usageData.componentCounts)
    .sort((a, b) => b[1] - a[1]);
  
  // Générer le contenu du rapport
  let report = `# Rapport d'utilisation des composants Chakra UI\n\n`;
  report += `Date: ${new Date().toLocaleDateString('fr-FR')}\n\n`;
  
  // 1. Résumé
  report += `## Résumé\n\n`;
  report += `- **${Object.keys(usageData.componentCounts).length}** composants Chakra UI identifiés\n`;
  report += `- **${Object.keys(usageData.fileUsage).length}** fichiers utilisant Chakra UI\n`;
  report += `- **${usageData.themeOverrides.length}** instances de personnalisation de thème\n\n`;
  
  // 2. Top des composants
  report += `## Top 10 des composants les plus utilisés\n\n`;
  report += `| Composant | Occurrences | Équivalent Radix UI + Tailwind |\n`;
  report += `|-----------|-------------|---------------------------------|\n`;
  
  sortedComponents.slice(0, 10).forEach(([component, count]) => {
    const equivalent = getRadixEquivalent(component);
    report += `| ${component} | ${count} | ${equivalent} |\n`;
  });
  
  report += `\n## Liste complète des composants\n\n`;
  report += `| Composant | Occurrences | Équivalent Radix UI + Tailwind | Priorité |\n`;
  report += `|-----------|-------------|----------------------------------|----------|\n`;
  
  sortedComponents.forEach(([component, count]) => {
    const equivalent = getRadixEquivalent(component);
    const priority = getPriorityLevel(count);
    report += `| ${component} | ${count} | ${equivalent} | ${priority} |\n`;
  });
  
  // 3. Modèles d'utilisation courants
  report += `\n## Modèles d'utilisation courants\n\n`;
  
  const topComponents = sortedComponents.slice(0, 5).map(item => item[0]);
  topComponents.forEach(component => {
    report += `### ${component}\n\n`;
    if (usageData.propUsage[component] && usageData.propUsage[component].length > 0) {
      report += `\`\`\`jsx\n<${component} ${usageData.propUsage[component][0]}>\n\`\`\`\n\n`;
      
      report += `**Équivalent Radix UI + Tailwind:**\n\n`;
      report += `\`\`\`jsx\n${getRadixExample(component, usageData.propUsage[component][0])}\n\`\`\`\n\n`;
    } else {
      report += `*Pas d'exemple d'utilisation trouvé*\n\n`;
    }
  });
  
  // 4. Recommendations pour la migration
  report += `## Recommandations pour la migration\n\n`;
  
  report += `### Plan par phase\n\n`;
  report += `#### Phase 1: Composants haute priorité\n\n`;
  const highPriorityComponents = sortedComponents
    .filter(([_, count]) => count > 10)
    .map(([component, _]) => `- [ ] ${component} → ${getRadixEquivalent(component)}`);
  
  report += highPriorityComponents.join('\n') + '\n\n';
  
  report += `#### Phase 2: Composants priorité moyenne\n\n`;
  const mediumPriorityComponents = sortedComponents
    .filter(([_, count]) => count > 3 && count <= 10)
    .map(([component, _]) => `- [ ] ${component} → ${getRadixEquivalent(component)}`);
  
  report += mediumPriorityComponents.join('\n') + '\n\n';
  
  report += `#### Phase 3: Composants basse priorité\n\n`;
  const lowPriorityComponents = sortedComponents
    .filter(([_, count]) => count <= 3)
    .map(([component, _]) => `- [ ] ${component} → ${getRadixEquivalent(component)}`);
  
  report += lowPriorityComponents.join('\n') + '\n\n';
  
  // 5. Personnalisations de thème
  report += `## Personnalisations de thème identifiées\n\n`;
  report += `Ces composants utilisent des propriétés de style spécifiques à Chakra UI:\n\n`;
  report += usageData.themeOverrides.map(item => `- ${item}`).join('\n') + '\n\n';
  
  // Écrire le rapport dans un fichier
  fs.writeFileSync(REPORT_FILE, report);
}

/**
 * Obtient l'équivalent Radix UI + Tailwind d'un composant Chakra UI
 */
function getRadixEquivalent(chakraComponent) {
  const equivalents = {
    'Button': '@/components/ui/button',
    'Box': 'div + Tailwind classes',
    'Flex': 'div + flex Tailwind classes',
    'Container': 'div + container Tailwind classes',
    'Input': '@/components/ui/input',
    'FormControl': 'form + Tailwind classes',
    'FormLabel': '@/components/ui/label',
    'FormHelperText': 'p + text-muted Tailwind class',
    'FormErrorMessage': 'p + text-destructive Tailwind class',
    'Modal': '@/components/ui/dialog',
    'ModalOverlay': 'Dialog.Overlay',
    'ModalContent': 'Dialog.Content',
    'ModalHeader': 'Dialog.Header',
    'ModalFooter': 'Dialog.Footer',
    'ModalBody': 'Dialog.Description',
    'ModalCloseButton': 'Dialog.Close',
    'Drawer': '@/components/ui/drawer',
    'Menu': '@/components/ui/dropdown-menu',
    'MenuButton': 'DropdownMenu.Trigger',
    'MenuList': 'DropdownMenu.Content',
    'MenuItem': 'DropdownMenu.Item',
    'Tabs': '@/components/ui/tabs',
    'TabList': 'Tabs.List',
    'Tab': 'Tabs.Trigger',
    'TabPanel': 'Tabs.Content',
    'Accordion': '@/components/ui/accordion',
    'AccordionItem': 'Accordion.Item',
    'AccordionButton': 'Accordion.Trigger',
    'AccordionPanel': 'Accordion.Content',
    'Switch': '@/components/ui/switch',
    'Checkbox': '@/components/ui/checkbox',
    'Radio': '@/components/ui/radio-group',
    'RadioGroup': '@/components/ui/radio-group',
    'Select': '@/components/ui/select',
    'Tooltip': '@/components/ui/tooltip',
    'Badge': '@/components/ui/badge',
    'Alert': '@/components/ui/alert',
    'AlertTitle': 'Alert.Title',
    'AlertDescription': 'Alert.Description',
    'Spinner': 'Loader component + Tailwind',
    'Text': 'p, span + Tailwind typography classes',
    'Heading': 'h1-h6 + Tailwind typography classes',
    'Stack': 'div + flex + gap Tailwind classes',
    'HStack': 'div + flex-row + gap Tailwind classes',
    'VStack': 'div + flex-col + gap Tailwind classes',
    'Grid': 'div + grid Tailwind classes',
    'Avatar': '@/components/ui/avatar',
    'AvatarGroup': 'Custom component with AvatarGroup',
    'Divider': '@/components/ui/separator',
    'Skeleton': '@/components/ui/skeleton',
    'Progress': '@/components/ui/progress',
    'Tag': '@/components/ui/badge',
    'Textarea': '@/components/ui/textarea',
    'Center': 'div + flex + items-center + justify-center',
    'Link': 'a + Tailwind classes',
    'Image': 'img + Tailwind classes or Image from next/image',
    'Icon': 'lucide-react icons',
    'IconButton': '@/components/ui/button avec variant="icon"',
    'Popover': '@/components/ui/popover',
    'Slider': '@/components/ui/slider',
    // Ajouter d'autres mappings selon les besoins
  };
  
  return equivalents[chakraComponent] || 'Composant personnalisé + Tailwind';
}

/**
 * Génère un exemple de code Radix UI + Tailwind équivalent
 */
function getRadixExample(chakraComponent, propString) {
  switch (chakraComponent) {
    case 'Button':
      let variant = 'default';
      let size = 'default';
      
      if (propString.includes('colorScheme="blue"')) variant = 'default';
      if (propString.includes('colorScheme="red"')) variant = 'destructive';
      if (propString.includes('variant="outline"')) variant = 'outline';
      if (propString.includes('variant="ghost"')) variant = 'ghost';
      if (propString.includes('variant="link"')) variant = 'link';
      if (propString.includes('size="sm"')) size = 'sm';
      if (propString.includes('size="lg"')) size = 'lg';
      
      return `import { Button } from '@/components/ui/button';\n\n<Button variant="${variant}" size="${size}">\n  Contenu du bouton\n</Button>`;
      
    case 'Box':
      let className = 'p-4 rounded-md';
      if (propString.includes('bg=')) className += ' bg-gray-100';
      if (propString.includes('shadow')) className += ' shadow-md';
      
      return `<div className="${className}">\n  Contenu\n</div>`;
      
    case 'Flex':
      let flexClassName = 'flex';
      if (propString.includes('direction="column"')) flexClassName += ' flex-col';
      if (propString.includes('align="center"')) flexClassName += ' items-center';
      if (propString.includes('justify="center"')) flexClassName += ' justify-center';
      if (propString.includes('gap=')) flexClassName += ' gap-4';
      
      return `<div className="${flexClassName}">\n  Contenu\n</div>`;
      
    case 'Modal':
      return `import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';\n\n<Dialog open={isOpen} onOpenChange={setIsOpen}>\n  <DialogContent>\n    <DialogHeader>\n      <DialogTitle>Titre du modal</DialogTitle>\n      <DialogDescription>\n        Contenu du modal\n      </DialogDescription>\n    </DialogHeader>\n    <DialogFooter>\n      <Button onClick={onClose}>Fermer</Button>\n    </DialogFooter>\n  </DialogContent>\n</Dialog>`;
      
    case 'Input':
      return `import { Input } from '@/components/ui/input';\n\n<Input placeholder="Entrez une valeur" />`;
      
    default:
      return `<!-- Consultez la documentation pour l'équivalent de ${chakraComponent} -->`;
  }
}

/**
 * Détermine le niveau de priorité basé sur le nombre d'occurrences
 */
function getPriorityLevel(count) {
  if (count > 10) return '🔴 Haute';
  if (count > 3) return '🟠 Moyenne';
  return '🟢 Basse';
}

// Exécution du script
analyzeProject(); 