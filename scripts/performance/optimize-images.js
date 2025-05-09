#!/usr/bin/env node

/**
 * Script d'optimisation d'images pour améliorer les Web Vitals
 * 
 * Ce script parcourt les images du projet et les optimise en:
 * - Redimensionnant les images trop grandes
 * - Convertissant en formats modernes (WebP, AVIF)
 * - Compressant les images sans perdre de qualité
 * - Générant des versions adaptées aux différentes tailles d'écran
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sharp = require('sharp');
const glob = require('glob');

// Configuration
const config = {
  inputDir: path.join(process.cwd(), 'public'),
  outputDir: path.join(process.cwd(), 'public', 'optimized'),
  quality: 80,
  sizes: [640, 750, 828, 1080, 1200, 1920],
  formats: ['webp', 'avif'],
  maxWidth: 1920,
  excludeDirs: ['node_modules', '.next', 'optimized'],
  extensions: ['.jpg', '.jpeg', '.png']
};

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

// Optimiser une image
async function optimizeImage(imagePath) {
  const filename = path.basename(imagePath, path.extname(imagePath));
  const relativePath = path.relative(config.inputDir, path.dirname(imagePath));
  const outputSubDir = path.join(config.outputDir, relativePath);
  
  // Créer le sous-répertoire de sortie si nécessaire
  if (!fs.existsSync(outputSubDir)) {
    fs.mkdirSync(outputSubDir, { recursive: true });
  }
  
  // Charger l'image avec Sharp
  let image = sharp(imagePath);
  const metadata = await image.metadata();
  
  // Redimensionner si nécessaire
  if (metadata.width > config.maxWidth) {
    image = image.resize(config.maxWidth);
  }
  
  // Générer des versions dans différents formats et tailles
  const promises = [];
  
  // Format original optimisé
  promises.push(
    image
      .clone()
      .jpeg({ quality: config.quality, mozjpeg: true })
      .toFile(path.join(outputSubDir, `${filename}.jpg`))
  );
  
  // Formats modernes
  for (const format of config.formats) {
    // Version pleine taille
    promises.push(
      image
        .clone()
        [format]({ quality: config.quality })
        .toFile(path.join(outputSubDir, `${filename}.${format}`))
    );
    
    // Versions responsive pour différentes tailles d'écran
    for (const width of config.sizes.filter(w => w <= metadata.width)) {
      promises.push(
        image
          .clone()
          .resize(width)
          [format]({ quality: config.quality })
          .toFile(path.join(outputSubDir, `${filename}-${width}.${format}`))
      );
    }
  }
  
  await Promise.all(promises);
  return promises.length;
}

// Générer un fichier de statistiques
function generateStats(totalImages, totalVariants, startTime) {
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  const stats = {
    date: new Date().toISOString(),
    totalImages,
    totalVariants,
    duration: `${duration.toFixed(2)} secondes`,
    config
  };
  
  fs.writeFileSync(
    path.join(config.outputDir, 'optimization-stats.json'),
    JSON.stringify(stats, null, 2)
  );
  
  console.log('\n📊 Statistiques:');
  console.log(`- Images traitées: ${totalImages}`);
  console.log(`- Variantes générées: ${totalVariants}`);
  console.log(`- Durée: ${duration.toFixed(2)} secondes`);
}

// Générer un fichier helper.js pour utiliser les images optimisées
function generateHelper() {
  const helperContent = `/**
 * Outil d'utilisation des images optimisées
 * Généré le ${new Date().toISOString()}
 */

/**
 * Récupère l'URL optimisée d'une image en fonction de la taille et du format
 * @param {string} src - Chemin de l'image originale (public/images/example.jpg)
 * @param {object} options - Options
 * @param {number} options.width - Largeur souhaitée (640, 750, 828, 1080, 1200, 1920)
 * @param {string} options.format - Format souhaité (webp, avif, jpg)
 * @param {boolean} options.original - Utiliser l'image originale non optimisée
 * @returns {string} URL de l'image optimisée
 */
export function getOptimizedImageUrl(src, options = {}) {
  if (!src) return '';
  
  // Si on demande l'original ou si c'est une URL externe, retourner tel quel
  if (options.original || src.startsWith('http') || src.startsWith('data:')) {
    return src;
  }
  
  const { width, format = 'webp' } = options;
  
  // Extraire le nom de fichier et l'extension
  const srcPath = src.startsWith('/') ? src.slice(1) : src;
  const basePath = srcPath.startsWith('public/') ? srcPath.slice(7) : srcPath;
  const extension = path.extname(basePath);
  const filename = path.basename(basePath, extension);
  const directory = path.dirname(basePath);
  
  // Construire le chemin optimisé
  let optimizedPath = \`/optimized/\${directory}/\${filename}\`;
  
  // Ajouter le suffixe de largeur si spécifié
  if (width) {
    optimizedPath += \`-\${width}\`;
  }
  
  // Ajouter l'extension du format
  optimizedPath += \`.\${format}\`;
  
  return optimizedPath;
}

/**
 * Génère un ensemble de sources pour l'élément <picture>
 * @param {string} src - Chemin de l'image originale
 * @returns {object} Sources et image par défaut pour l'élément picture
 */
export function getResponsiveImageSources(src) {
  if (!src || src.startsWith('http') || src.startsWith('data:')) {
    return { 
      sources: [],
      defaultSrc: src
    };
  }
  
  const sizes = ${JSON.stringify(config.sizes)};
  const formats = ${JSON.stringify(config.formats)};
  
  const sources = formats.map(format => ({
    type: \`image/\${format}\`,
    srcSet: sizes.map(size => 
      \`\${getOptimizedImageUrl(src, { width: size, format })} \${size}w\`
    ).join(', '),
    sizes: '(max-width: 640px) 640px, (max-width: 750px) 750px, (max-width: 828px) 828px, (max-width: 1080px) 1080px, (max-width: 1200px) 1200px, 1920px'
  }));
  
  return {
    sources,
    defaultSrc: getOptimizedImageUrl(src, { format: 'jpg' })
  };
}

/**
 * Composant React pour afficher une image optimisée avec <picture>
 * @param {object} props - Props du composant
 * @param {string} props.src - Chemin de l'image
 * @param {string} props.alt - Texte alternatif
 * @param {object} props.imgProps - Props supplémentaires pour la balise img
 * @returns {React.Element} Élément picture avec sources optimisées
 */
export function OptimizedImage({ src, alt = '', imgProps = {}, ...rest }) {
  const { sources, defaultSrc } = getResponsiveImageSources(src);
  
  return (
    <picture {...rest}>
      {sources.map((source, index) => (
        <source key={index} type={source.type} srcSet={source.srcSet} sizes={source.sizes} />
      ))}
      <img src={defaultSrc} alt={alt} {...imgProps} />
    </picture>
  );
}
`;

  fs.writeFileSync(
    path.join(process.cwd(), 'src', 'lib', 'optimizedImages.js'),
    helperContent
  );
  
  console.log('✅ Helper optimizedImages.js généré');
}

// Fonction principale
async function main() {
  const startTime = Date.now();
  console.log('🖼️  Début de l\'optimisation des images...');
  
  checkDependencies();
  createOutputDir();
  
  const images = findImages();
  console.log(`🔍 ${images.length} images trouvées`);
  
  let totalVariants = 0;
  
  for (let i = 0; i < images.length; i++) {
    const imagePath = images[i];
    console.log(`⚙️  [${i+1}/${images.length}] Optimisation de ${path.basename(imagePath)}`);
    
    try {
      const variants = await optimizeImage(imagePath);
      totalVariants += variants;
      console.log(`   ✅ ${variants} variantes générées`);
    } catch (error) {
      console.error(`   ❌ Erreur: ${error.message}`);
    }
  }
  
  generateStats(images.length, totalVariants, startTime);
  generateHelper();
  
  console.log('\n🎉 Optimisation terminée!');
  console.log(`📁 Les images optimisées sont disponibles dans: ${config.outputDir}`);
  console.log('💡 Utilisez src/lib/optimizedImages.js pour afficher les images optimisées');
}

main().catch(error => {
  console.error('Erreur:', error);
  process.exit(1);
}); 