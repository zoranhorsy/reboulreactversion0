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
    if (content.includes('<ClientPageWrapper>')) {
      console.log(`${filePath} contient déjà ClientPageWrapper.`);
      return;
    }
    
    // Ajouter l'import pour ClientPageWrapper s'il n'existe pas déjà
    if (!content.includes("import { ClientPageWrapper")) {
      // Vérifier si c'est un composant client
      const isClientComponent = content.includes("'use client'");
      
      if (isClientComponent) {
        // Pour les composants 'use client'
        content = content.replace(
          /'use client'(\s*)\n/,
          `'use client'$1\n\nimport { ClientPageWrapper, defaultViewport } from '@/components/ClientPageWrapper';\nimport type { Viewport } from 'next';\n`
        );
      } else {
        // Pour les composants côté serveur
        content = content.replace(
          /^(import .+? from .+?;\n)/,
          `import { ClientPageWrapper, defaultViewport } from '@/components/ClientPageWrapper';\nimport type { Viewport } from 'next';\n$1`
        );
      }
    }
    
    // Ajouter l'export de viewport s'il n'existe pas déjà
    if (!content.includes("export const viewport")) {
      content = content.replace(
        /export default/,
        `export const viewport: Viewport = defaultViewport;\n\nexport default`
      );
    }
    
    // Analyser le contenu pour trouver la fonction principale qui retourne du JSX
    const mainFunctionMatch = content.match(/export default\s+(?:async\s+)?function\s+([a-zA-Z0-9_]+)/);
    if (!mainFunctionMatch) {
      console.warn(`Impossible de trouver la fonction principale dans ${filePath}`);
      return;
    }
    
    const mainFunctionName = mainFunctionMatch[1];
    
    // Trouver le bloc de retour JSX en comptant les accolades
    let startPos = content.indexOf(`export default function ${mainFunctionName}`);
    if (startPos === -1) {
      startPos = content.indexOf(`export default async function ${mainFunctionName}`);
    }
    
    if (startPos === -1) {
      console.warn(`Impossible de trouver la définition de la fonction ${mainFunctionName} dans ${filePath}`);
      return;
    }
    
    // Trouver le début du bloc return
    const returnPos = content.indexOf('return', startPos);
    if (returnPos === -1) {
      console.warn(`Impossible de trouver le bloc return dans ${filePath}`);
      return;
    }
    
    // Détecter si le return est simple ou complexe
    const isSimpleReturn = /return\s+<[^>]+>[^;]*;/.test(content.substring(returnPos));
    
    if (isSimpleReturn) {
      // Pour un return simple comme: return <Component />;
      content = content.replace(
        /return\s+(<[^>]+>[^;]*);/,
        `return (\n    <ClientPageWrapper>\n      $1\n    </ClientPageWrapper>\n  );`
      );
    } else {
      // Pour un return avec JSX complexe
      // Trouver la position du caractère après 'return ('
      const jsxStartPos = content.indexOf('(', returnPos) + 1;
      
      // Trouver la position de la parenthèse fermante correspondante
      let openParens = 1;
      let closePos = jsxStartPos;
      
      while (openParens > 0 && closePos < content.length) {
        closePos++;
        if (content[closePos] === '(') openParens++;
        if (content[closePos] === ')') openParens--;
      }
      
      // Extraire le JSX
      const jsxContent = content.substring(jsxStartPos, closePos).trim();
      
      // Remplacer le JSX par le JSX enveloppé
      const wrappedJSX = `(\n    <ClientPageWrapper>\n      ${jsxContent}\n    </ClientPageWrapper>\n  )`;
      content = content.substring(0, jsxStartPos) + wrappedJSX + content.substring(closePos);
    }
    
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
      try {
        // Vérifier s'il contient déjà ClientPageWrapper visuellement
        const content = await readFileAsync(filePath, 'utf8');
        if (content.includes('<ClientPageWrapper>')) {
          console.log(`✓ ${filePath} contient déjà ClientPageWrapper.`);
          continue;
        }
        
        console.log(`Traitement de ${filePath}...`);
        await addClientPageWrapper(filePath);
      } catch (error) {
        console.error(`Erreur lors du traitement de ${filePath}:`, error);
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