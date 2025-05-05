const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Répertoire des pages
const pagesDir = path.join(__dirname, 'src', 'app');

// Fonction pour vérifier si un fichier contient déjà ClientPageWrapper
async function hasClientPageWrapper(filePath) {
  try {
    const content = await readFileAsync(filePath, 'utf8');
    return content.includes('ClientPageWrapper');
  } catch (error) {
    console.error(`Erreur lors de la lecture du fichier ${filePath}:`, error);
    return false;
  }
}

// Fonction pour ajouter ClientPageWrapper au fichier
async function addClientPageWrapper(filePath) {
  try {
    let content = await readFileAsync(filePath, 'utf8');
    
    // Vérifier si le fichier contient déjà ClientPageWrapper
    if (content.includes('ClientPageWrapper')) {
      console.log(`${filePath} contient déjà ClientPageWrapper.`);
      return;
    }
    
    // Ajouter l'import pour ClientPageWrapper s'il n'existe pas déjà
    if (!content.includes("import { ClientPageWrapper")) {
      content = content.replace(
        /import (.+?) from/,
        `import { ClientPageWrapper, defaultViewport } from '@/components/ClientPageWrapper';\nimport type { Viewport } from 'next';\nimport $1 from`
      );
    }
    
    // Ajouter l'export de viewport s'il n'existe pas déjà
    if (!content.includes("export const viewport")) {
      content = content.replace(
        /export default/,
        `export const viewport: Viewport = defaultViewport;\n\nexport default`
      );
    }
    
    // Envelopper le contenu du composant avec ClientPageWrapper
    content = content.replace(
      /return\s*\(\s*([^)]+)\s*\)\s*;?\s*}/,
      (match, p1) => {
        // Si le contenu n'est pas déjà enveloppé dans ClientPageWrapper
        if (!p1.includes("<ClientPageWrapper")) {
          return `return (\n    <ClientPageWrapper>\n      ${p1.trim()}\n    </ClientPageWrapper>\n  );}`
        }
        return match;
      }
    );
    
    // Pour les retours simples sans parenthèses
    content = content.replace(
      /return\s+(<[^>]+>[^;]*);\s*}/,
      (match, p1) => {
        if (!p1.includes("<ClientPageWrapper")) {
          return `return (\n    <ClientPageWrapper>\n      ${p1.trim()}\n    </ClientPageWrapper>\n  );}`
        }
        return match;
      }
    );
    
    // Écriture du fichier modifié
    await writeFileAsync(filePath, content, 'utf8');
    console.log(`✓ ${filePath} modifié avec succès.`);
  } catch (error) {
    console.error(`Erreur lors de la modification du fichier ${filePath}:`, error);
  }
}

// Fonction récursive pour parcourir les dossiers
async function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      await processDirectory(filePath);
    } else if (file === 'page.tsx') {
      const hasWrapper = await hasClientPageWrapper(filePath);
      if (!hasWrapper) {
        console.log(`Traitement de ${filePath}...`);
        await addClientPageWrapper(filePath);
      } else {
        console.log(`✓ ${filePath} contient déjà ClientPageWrapper.`);
      }
    }
  }
}

// Exécution principale
async function main() {
  console.log('Début de la mise à jour des pages...');
  await processDirectory(pagesDir);
  console.log('Mise à jour terminée !');
}

main().catch(err => {
  console.error('Une erreur est survenue:', err);
}); 