#!/usr/bin/env node

/**
 * Script pour corriger les images corrompues
 * Ce script génère des images de remplacement pour les fichiers corrompus
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const sharp = require('sharp');

// Chemin vers le fichier des images corrompues
const corruptedImagesPath = path.join(process.cwd(), 'public', 'optimized', 'corrupted-images.json');

// Dossier de sortie
const outputDir = path.join(process.cwd(), 'public', 'optimized');

// Configuration
const config = {
  placeholderColor: '#f0f0f0',
  textColor: '#999999',
  fontSize: 14,
  sizes: {
    'placeholder.jpg': { width: 400, height: 400 },
    'placeholder.png': { width: 400, height: 400 },
    'no-image.png': { width: 400, height: 400 },
    'noise.png': { width: 400, height: 400 },
    'sneakers-day-coming-soon.jpg': { width: 1200, height: 800 },
    'launch-cp-coming-soon.jpg': { width: 1200, height: 800 },
    'fashion-night-coming-soon.jpg': { width: 1200, height: 800 }
  },
  formats: ['jpg', 'webp', 'avif'],
  responsiveSizes: [640, 750, 828, 1080, 1200]
};

// Vérifier si les dépendances sont installées
try {
  require.resolve('canvas');
} catch (error) {
  console.log('⚠️  Installation de la dépendance canvas...');
  require('child_process').execSync('npm install --save-dev canvas', { stdio: 'inherit' });
}

// Créer une image placeholder
async function createPlaceholder(filename, width, height) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Remplir le fond
  ctx.fillStyle = config.placeholderColor;
  ctx.fillRect(0, 0, width, height);
  
  // Ajouter une bordure
  ctx.strokeStyle = '#dddddd';
  ctx.lineWidth = 2;
  ctx.strokeRect(5, 5, width - 10, height - 10);
  
  // Ajouter le texte
  ctx.fillStyle = config.textColor;
  ctx.font = `${config.fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(`Image placeholder (${width}x${height})`, width / 2, height / 2);
  ctx.fillText(filename, width / 2, height / 2 + 20);
  
  // Retourner le buffer PNG
  return canvas.toBuffer('image/png');
}

// Générer les versions de l'image
async function generateImageVersions(imageBuffer, filename, basePath) {
  const filenameWithoutExt = path.basename(filename, path.extname(filename));
  const outputSubDir = path.join(outputDir, path.dirname(basePath));
  
  // Créer le sous-répertoire si nécessaire
  if (!fs.existsSync(outputSubDir)) {
    fs.mkdirSync(outputSubDir, { recursive: true });
  }
  
  // Générer toutes les versions
  const promises = [];
  
  // Image principale dans différents formats
  for (const format of config.formats) {
    promises.push(
      sharp(imageBuffer)
        [format === 'jpg' ? 'jpeg' : format]({ 
          quality: format === 'avif' ? 65 : 80 
        })
        .toFile(path.join(outputSubDir, `${filenameWithoutExt}.${format}`))
    );
    
    // Versions responsives
    for (const size of config.responsiveSizes) {
      promises.push(
        sharp(imageBuffer)
          .resize(size)
          [format === 'jpg' ? 'jpeg' : format]({ 
            quality: format === 'avif' ? 65 : 80 
          })
          .toFile(path.join(outputSubDir, `${filenameWithoutExt}-${size}.${format}`))
      );
    }
  }
  
  await Promise.all(promises);
  return promises.length;
}

// Fonction principale
async function main() {
  console.log('🔍 Recherche des images corrompues...');
  
  if (!fs.existsSync(corruptedImagesPath)) {
    console.log('❌ Fichier corrupted-images.json non trouvé!');
    return;
  }
  
  // Charger la liste des images corrompues
  const corruptedImages = JSON.parse(fs.readFileSync(corruptedImagesPath, 'utf8'));
  console.log(`🖼️  ${corruptedImages.length} images corrompues trouvées`);
  
  if (corruptedImages.length === 0) {
    console.log('✅ Aucune image à corriger');
    return;
  }
  
  let fixedCount = 0;
  let totalVariants = 0;
  
  // Traiter chaque image corrompue
  for (const imagePath of corruptedImages) {
    try {
      const filename = path.basename(imagePath);
      const relativePath = path.relative(path.join(process.cwd(), 'public'), path.dirname(imagePath));
      
      // Déterminer la taille de l'image
      let width = 400;
      let height = 400;
      
      for (const [key, size] of Object.entries(config.sizes)) {
        if (filename.includes(key)) {
          width = size.width;
          height = size.height;
          break;
        }
      }
      
      console.log(`📐 Création d'un placeholder pour ${filename} (${width}x${height})...`);
      
      // Créer une image placeholder
      const imageBuffer = await createPlaceholder(filename, width, height);
      
      // Générer les versions optimisées
      const variants = await generateImageVersions(imageBuffer, filename, relativePath);
      totalVariants += variants;
      fixedCount++;
      
      console.log(`✅ Image ${filename} remplacée et optimisée (${variants} variantes générées)`);
    } catch (error) {
      console.log(`❌ Erreur lors de la correction de ${imagePath}: ${error.message}`);
    }
  }
  
  console.log('\n📊 Résumé:');
  console.log(`✅ ${fixedCount}/${corruptedImages.length} images remplacées par des placeholders`);
  console.log(`🖼️ ${totalVariants} variantes générées au total`);
  
  if (fixedCount === corruptedImages.length) {
    console.log('🎉 Toutes les images corrompues ont été remplacées avec succès!');
    
    // Renommer le fichier des images corrompues pour indiquer qu'elles ont été traitées
    const fixedImagesPath = path.join(outputDir, 'fixed-images.json');
    fs.renameSync(corruptedImagesPath, fixedImagesPath);
    console.log(`✅ Le fichier corrupted-images.json a été renommé en fixed-images.json`);
  } else {
    console.log('⚠️ Certaines images n\'ont pas pu être remplacées.');
    
    // Mettre à jour le fichier des images corrompues
    const remainingImages = corruptedImages.filter(imagePath => {
      const filename = path.basename(imagePath);
      const relativePath = path.relative(path.join(process.cwd(), 'public'), path.dirname(imagePath));
      const outputPath = path.join(outputDir, relativePath, filename);
      return !fs.existsSync(outputPath);
    });
    
    fs.writeFileSync(corruptedImagesPath, JSON.stringify(remainingImages, null, 2));
    console.log(`✅ Le fichier corrupted-images.json a été mis à jour (${remainingImages.length} images restantes)`);
  }
}

// Exécuter le script
main().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
}); 