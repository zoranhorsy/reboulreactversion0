#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script SÉCURISÉ pour corriger les caractères non échappés dans JSX
 * - Fait des sauvegardes automatiques
 * - Montre les changements avant de les appliquer
 * - Remplace uniquement les patterns ESLint spécifiques
 * - Mode test disponible
 */

// Configuration
const CONFIG = {
  // Extensions de fichiers à traiter
  extensions: ['.tsx', '.jsx'],
  
  // Répertoires à traiter
  srcDirs: ['src'],
  
  // Répertoire de sauvegarde
  backupDir: './backups/jsx-fixes-' + new Date().toISOString().slice(0, 10),
  
  // Patterns à corriger (très conservateurs et précis)
  replacements: [
    // Guillemets dans les spans et texte JSX
    {
      pattern: /(\<[^>]*\>)([^<]*)"([^<]*)"([^<]*\<\/[^>]*\>)/g,
      replacement: '$1$2&quot;$3&quot;$4',
      description: 'Guillemets dans le contenu des balises'
    },
    {
      pattern: /(\<span[^>]*\>)"([^"]*)"(\<\/span\>)/g,
      replacement: '$1&quot;$2&quot;$3',
      description: 'Guillemets dans les spans'
    },
    // Apostrophes dans le texte JSX (entre balises)
    {
      pattern: /(\s+)([^<>]*)'([^<>']*)/g,
      replacement: '$1$2&apos;$3',
      description: 'Apostrophes dans le texte JSX'
    },
    // Guillemets dans les attributs HTML (pas JSX)
    {
      pattern: /(\s+[a-zA-Z-]+\s*=\s*)"([^"]*)"(\s*[/>])/g,
      replacement: '$1&quot;$2&quot;$3',
      description: 'Guillemets dans les attributs HTML'
    },
    // Guillemets dans le contenu textuel des balises
    {
      pattern: /(>[\s]*)"([^"<]*)"([\s]*<)/g,
      replacement: '$1&quot;$2&quot;$3',
      description: 'Guillemets dans le contenu des balises'
    },
    // Cas spécifiques pour les messages d'erreur
    {
      pattern: /(\{[^}]*)"([^"]*)"([^}]*\})/g,
      replacement: '$1&quot;$2&quot;$3',
      description: 'Guillemets dans les expressions JSX'
    }
  ]
};

class SafeJSXFixer {
  constructor() {
    this.dryRun = process.argv.includes('--dry-run');
    this.verbose = process.argv.includes('--verbose');
    this.targetFiles = process.argv.includes('--file') ? 
      [process.argv[process.argv.indexOf('--file') + 1]] : null;
  }

  log(message, level = 'info') {
    const prefix = {
      info: '📝',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.log(`${prefix[level]} ${message}`);
  }

  async createBackup() {
    if (this.dryRun) {
      this.log('Mode test : pas de sauvegarde nécessaire', 'info');
      return;
    }

    this.log(`Création du répertoire de sauvegarde : ${CONFIG.backupDir}`, 'info');
    
    if (!fs.existsSync(CONFIG.backupDir)) {
      fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    }

    // Copier tous les fichiers source
    for (const srcDir of CONFIG.srcDirs) {
      const backupSrcDir = path.join(CONFIG.backupDir, srcDir);
      if (fs.existsSync(srcDir)) {
        execSync(`cp -r ${srcDir} ${CONFIG.backupDir}/`);
        this.log(`Sauvegardé : ${srcDir} → ${backupSrcDir}`, 'success');
      }
    }
  }

  findFilesToProcess() {
    const files = [];
    
    if (this.targetFiles) {
      return this.targetFiles.filter(file => fs.existsSync(file));
    }

    function findFiles(dir) {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          findFiles(fullPath);
        } else if (CONFIG.extensions.some(ext => fullPath.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }

    for (const srcDir of CONFIG.srcDirs) {
      findFiles(srcDir);
    }

    return files;
  }

  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const changes = [];

    for (const rule of CONFIG.replacements) {
      const matches = [...content.matchAll(rule.pattern)];
      
      for (const match of matches) {
        changes.push({
          rule: rule.description,
          line: content.substring(0, match.index).split('\n').length,
          original: match[0],
          replacement: match[0].replace(rule.pattern, rule.replacement),
          pattern: rule.pattern
        });
      }
    }

    return { content, changes };
  }

  applyChanges(content, changes) {
    let newContent = content;
    
    // Appliquer les changements dans l'ordre inverse pour préserver les indices
    changes.reverse().forEach(change => {
      newContent = newContent.replace(change.pattern, change.replacement);
    });

    return newContent;
  }

  async processFile(filePath) {
    this.log(`\n🔍 Analyse : ${filePath}`, 'info');
    
    const { content, changes } = this.analyzeFile(filePath);
    
    if (changes.length === 0) {
      this.log('  Aucun changement nécessaire', 'success');
      return { processed: false, changes: 0 };
    }

    this.log(`  ${changes.length} changement(s) détecté(s) :`, 'warning');
    
    changes.forEach((change, index) => {
      this.log(`  ${index + 1}. Ligne ${change.line} - ${change.rule}`);
      if (this.verbose) {
        this.log(`     Avant : ${change.original}`);
        this.log(`     Après : ${change.replacement}`);
      }
    });

    if (this.dryRun) {
      this.log('  Mode test : fichier non modifié', 'info');
      return { processed: false, changes: changes.length };
    }

    // Appliquer les changements
    const newContent = this.applyChanges(content, changes);
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    this.log(`  ✅ Fichier modifié avec ${changes.length} changement(s)`, 'success');
    return { processed: true, changes: changes.length };
  }

  async run() {
    this.log('🚀 Démarrage du correcteur JSX sécurisé', 'info');
    this.log(`Mode : ${this.dryRun ? 'TEST (--dry-run)' : 'MODIFICATION RÉELLE'}`, 'warning');

    try {
      // Créer la sauvegarde
      await this.createBackup();

      // Trouver les fichiers à traiter
      const files = this.findFilesToProcess();
      this.log(`\n📁 ${files.length} fichier(s) trouvé(s) à analyser`, 'info');

      if (files.length === 0) {
        this.log('Aucun fichier à traiter', 'warning');
        return;
      }

      // Traiter chaque fichier
      let totalChanges = 0;
      let processedFiles = 0;

      for (const file of files) {
        const result = await this.processFile(file);
        totalChanges += result.changes;
        if (result.processed) processedFiles++;
      }

      // Résumé
      this.log(`\n📊 RÉSUMÉ :`, 'info');
      this.log(`   • Fichiers analysés : ${files.length}`, 'info');
      this.log(`   • Fichiers modifiés : ${processedFiles}`, 'success');
      this.log(`   • Total changements : ${totalChanges}`, 'success');

      if (this.dryRun) {
        this.log('\n💡 Pour appliquer les changements : node scripts/fix-jsx-entities-safe.js', 'info');
      } else {
        this.log(`\n💾 Sauvegarde disponible dans : ${CONFIG.backupDir}`, 'info');
        this.log('🔄 Pour restaurer : cp -r ' + CONFIG.backupDir + '/src/* src/', 'info');
      }

    } catch (error) {
      this.log(`Erreur : ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Afficher l'aide
if (process.argv.includes('--help')) {
  console.log(`
🛠️  Correcteur JSX Sécurisé pour Reboul

UTILISATION :
  node scripts/fix-jsx-entities-safe.js [options]

OPTIONS :
  --dry-run         Mode test (ne modifie pas les fichiers)
  --verbose         Affichage détaillé des changements
  --file <path>     Traiter un seul fichier
  --help            Afficher cette aide

EXEMPLES :
  # Test sur tous les fichiers
  node scripts/fix-jsx-entities-safe.js --dry-run

  # Test détaillé sur un fichier
  node scripts/fix-jsx-entities-safe.js --dry-run --verbose --file src/components/test.tsx

  # Appliquer les corrections
  node scripts/fix-jsx-entities-safe.js

  # Restaurer depuis la sauvegarde
  cp -r backups/jsx-fixes-YYYY-MM-DD/src/* src/
`);
  process.exit(0);
}

// Exécuter le script
const fixer = new SafeJSXFixer();
fixer.run().catch(console.error); 