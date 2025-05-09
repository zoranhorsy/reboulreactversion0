#!/usr/bin/env node

/**
 * Script de conversion d'images aux formats WebP et AVIF
 * Ce script parcourt le dossier public/images et convertit les images en WebP et AVIF
 * 
 * Utilisation: node src/scripts/performance/convert-to-webp-avif.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const glob = require('glob');
const { execSync } = require('child_process');

// Configuration
const config = {
  inputDir: path.join(process.cwd(), 'public'),
  outputDir: path.join(process.cwd(), 'public', 'optimized'),
  quality: {
    webp: 80,
    avif: 65
  },
  sizes: [640, 750, 828, 1080, 1200, 1920],
  formats: ['webp', 'avif'],
  maxWidth: 1920,
  excludeDirs: ['node_modules', '.next', 'optimized'],
  extensions: ['.jpg', '.jpeg', '.png']
};

// Liste des images corrompues
const corruptedImages = [];

// Vérifier si Sharp est installé, sinon l'installer
function checkDependencies() {
  try {
    require.resolve('sharp');
    require.resolve('glob');
    console.log('✅ Dépendances nécessaires trouvées');
  } catch (error) {
    console.log('⚠️  Installation des dépendances nécessaires...');
    execSync('npm install --save-dev sharp glob', { stdio: 'inherit' });
  }
}

// Créer le répertoire de sortie s'il n'existe pas
function createOutputDir() {
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
    console.log(`✅ Répertoire créé: ${config.outputDir}`);
  }
}

// Trouver toutes les images
function findImages() {
  const patterns = config.extensions.map(ext => 
    path.join(config.inputDir, `**/*${ext}`)
  );
  
  let allImages = [];
  patterns.forEach(pattern => {
    const images = glob.sync(pattern, {
      ignore: config.excludeDirs.map(dir => `**/${dir}/**`)
    });
    allImages = [...allImages, ...images];
  });
  
  return allImages;
}

// Vérifier si une image est valide avant de la convertir
async function isValidImage(imagePath) {
  try {
    // Tenter de lire les métadonnées de l'image pour vérifier sa validité
    const metadata = await sharp(imagePath, { failOn: 'none' }).metadata();
    return !!metadata.width && !!metadata.height;
  } catch (error) {
    return false;
  }
}

// Convertir une image aux formats WebP et AVIF
async function convertImage(imagePath) {
  // Vérifier si l'image est valide
  const isValid = await isValidImage(imagePath);
  if (!isValid) {
    console.log(`⚠️  Image ignorée (corrompue ou invalide): ${imagePath}`);
    corruptedImages.push(imagePath);
    return 0;
  }

  const filename = path.basename(imagePath, path.extname(imagePath));
  const relativePath = path.relative(config.inputDir, path.dirname(imagePath));
  const outputSubDir = path.join(config.outputDir, relativePath);
  
  // Créer le sous-répertoire de sortie si nécessaire
  if (!fs.existsSync(outputSubDir)) {
    fs.mkdirSync(outputSubDir, { recursive: true });
  }
  
  // Charger l'image avec Sharp avec options pour ignorer les erreurs mineures
  let image;
  try {
    image = sharp(imagePath, { failOn: 'none' });
    const metadata = await image.metadata();
    
    // Si on ne peut pas obtenir les métadonnées, on ignore l'image
    if (!metadata.width || !metadata.height) {
      console.log(`⚠️  Image ignorée (métadonnées manquantes): ${imagePath}`);
      corruptedImages.push(imagePath);
      return 0;
    }
    
    // Redimensionner si nécessaire
    if (metadata.width > config.maxWidth) {
      image = image.resize(config.maxWidth);
    }
  } catch (error) {
    console.log(`⚠️  Erreur lors du chargement de l'image ${imagePath}: ${error.message}`);
    corruptedImages.push(imagePath);
    return 0;
  }
  
  // Générer des versions dans différents formats et tailles
  const promises = [];
  
  try {
    // Format original optimisé (JPEG)
    promises.push(
      image
        .clone()
        .jpeg({ quality: 85, mozjpeg: true })
        .toFile(path.join(outputSubDir, `${filename}.jpg`))
        .catch(err => console.log(`⚠️  Erreur lors de la génération JPEG pour ${filename}: ${err.message}`))
    );
    
    // Format WebP
    promises.push(
      image
        .clone()
        .webp({ quality: config.quality.webp })
        .toFile(path.join(outputSubDir, `${filename}.webp`))
        .catch(err => console.log(`⚠️  Erreur lors de la génération WebP pour ${filename}: ${err.message}`))
    );
    
    // Format AVIF
    promises.push(
      image
        .clone()
        .avif({ quality: config.quality.avif })
        .toFile(path.join(outputSubDir, `${filename}.avif`))
        .catch(err => console.log(`⚠️  Erreur lors de la génération AVIF pour ${filename}: ${err.message}`))
    );
    
    // Récupérer les métadonnées pour générer les versions responsives
    const metadata = await image.metadata();
    
    // Générer des versions responsives pour chaque format
    for (const size of config.sizes.filter(w => w <= metadata.width)) {
      const resizedImage = image.clone().resize(size);
      
      // WebP responsive
      promises.push(
        resizedImage
          .clone()
          .webp({ quality: config.quality.webp })
          .toFile(path.join(outputSubDir, `${filename}-${size}.webp`))
          .catch(err => console.log(`⚠️  Erreur lors de la génération WebP ${size}px pour ${filename}: ${err.message}`))
      );
      
      // AVIF responsive
      promises.push(
        resizedImage
          .clone()
          .avif({ quality: config.quality.avif })
          .toFile(path.join(outputSubDir, `${filename}-${size}.avif`))
          .catch(err => console.log(`⚠️  Erreur lors de la génération AVIF ${size}px pour ${filename}: ${err.message}`))
      );
      
      // JPEG responsive (fallback)
      promises.push(
        resizedImage
          .clone()
          .jpeg({ quality: 85, mozjpeg: true })
          .toFile(path.join(outputSubDir, `${filename}-${size}.jpg`))
          .catch(err => console.log(`⚠️  Erreur lors de la génération JPEG ${size}px pour ${filename}: ${err.message}`))
      );
    }
    
    const results = await Promise.allSettled(promises);
    const fulfilled = results.filter(r => r.status === 'fulfilled').length;
    
    return fulfilled;
  } catch (error) {
    console.log(`⚠️  Erreur lors de la conversion de ${imagePath}: ${error.message}`);
    corruptedImages.push(imagePath);
    return 0;
  }
}

// Afficher la progression
function showProgress(current, total) {
  const percent = Math.round((current / total) * 100);
  process.stdout.write(`\rProgression: ${current}/${total} (${percent}%)`);
}

// Générer un rapport de conversion
function generateReport(stats) {
  const reportPath = path.join(config.outputDir, 'conversion-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(stats, null, 2));
  console.log(`\n✅ Rapport généré: ${reportPath}`);
  
  // Si on a des images corrompues, les lister dans un fichier séparé
  if (corruptedImages.length > 0) {
    const corruptedPath = path.join(config.outputDir, 'corrupted-images.json');
    fs.writeFileSync(corruptedPath, JSON.stringify(corruptedImages, null, 2));
    console.log(`⚠️  ${corruptedImages.length} images corrompues listées dans: ${corruptedPath}`);
  }
}

// Fonction principale
async function main() {
  console.log('🔍 Vérification des dépendances...');
  checkDependencies();
  
  console.log('📁 Création du répertoire de sortie...');
  createOutputDir();
  
  console.log('🔎 Recherche des images...');
  const images = findImages();
  console.log(`🖼️  ${images.length} images trouvées`);
  
  if (images.length === 0) {
    console.log('⚠️  Aucune image trouvée. Vérifiez la configuration.');
    return;
  }
  
  console.log('🔄 Conversion des images en WebP et AVIF...');
  const startTime = Date.now();
  
  let totalVariants = 0;
  let successCount = 0;
  
  for (let i = 0; i < images.length; i++) {
    const imagePath = images[i];
    try {
      const variants = await convertImage(imagePath);
      totalVariants += variants;
      if (variants > 0) {
        successCount++;
      }
    } catch (error) {
      console.log(`\n⚠️  Erreur lors de la conversion de ${imagePath}: ${error.message}`);
      corruptedImages.push(imagePath);
    }
    
    showProgress(i + 1, images.length);
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`\n✅ Conversion terminée en ${duration} secondes`);
  console.log(`📊 Images converties: ${successCount}/${images.length}`);
  console.log(`🖼️  Variantes générées: ${totalVariants}`);
  
  if (corruptedImages.length > 0) {
    console.log(`⚠️  Images corrompues ou ignorées: ${corruptedImages.length}`);
  }
  
  // Générer le rapport
  const stats = {
    timestamp: new Date().toISOString(),
    duration: `${duration} secondes`,
    totalImages: images.length,
    convertedImages: successCount,
    totalVariants,
    corruptedImages: corruptedImages.length,
    configuration: config
  };
  
  generateReport(stats);
  
  console.log('\n✨ Conversion terminée avec succès!');
  console.log('📝 Voici les formats générés pour chaque image:');
  console.log('  - WebP: Meilleur rapport qualité/poids, supporté par Chrome, Firefox, Edge');
  console.log('  - AVIF: Meilleure compression, supporté par Chrome, Firefox');
  console.log('  - JPEG: Format de secours pour les anciens navigateurs');
}

// Gérer les interruptions (Ctrl+C)
process.on('SIGINT', function() {
  console.log("\n\n⚠️  Conversion interrompue par l'utilisateur");
  if (corruptedImages.length > 0) {
    console.log(`⚠️  ${corruptedImages.length} images corrompues ou ignorées.`);
    const corruptedPath = path.join(config.outputDir, 'corrupted-images.json');
    fs.writeFileSync(corruptedPath, JSON.stringify(corruptedImages, null, 2));
    console.log(`⚠️  Liste des images corrompues sauvegardée dans: ${corruptedPath}`);
  }
  process.exit();
});

// Exécuter le script
main().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
}); 