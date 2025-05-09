#!/usr/bin/env node

const esbuild = require('esbuild');
const { globSync } = require('glob');
const path = require('path');
const fs = require('fs');

// Configuration
const WORKERS_DIR = path.join(__dirname, '../src/workers');
const PUBLIC_DIR = path.join(__dirname, '../public/workers');

// Créer le répertoire public/workers s'il n'existe pas
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Trouvez tous les fichiers worker
const workerFiles = globSync('src/workers/**/*.ts');

// Compilez chaque worker
workerFiles.forEach(async (workerFile) => {
  const fileName = path.basename(workerFile, '.ts');
  const outfile = path.join(PUBLIC_DIR, `${fileName}.js`);
  
  try {
    await esbuild.build({
      entryPoints: [workerFile],
      bundle: true,
      minify: true,
      sourcemap: true,
      target: ['es2020'],
      outfile,
      format: 'iife',
    });
    
    console.log(`✅ Compiled: ${fileName}.js`);
  } catch (error) {
    console.error(`❌ Error compiling ${fileName}.js:`, error);
    process.exit(1);
  }
});

console.log('All workers compiled successfully 🚀'); 