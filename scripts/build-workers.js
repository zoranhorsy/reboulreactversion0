#!/usr/bin/env node

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

// Liste des workers à compiler
const workers = [
  'cartWorker',
  'filterWorker',
  'imageWorker',
  'priorityWorker'
];

// Configuration de base pour esbuild
const baseConfig = {
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['es2020'],
  format: 'iife',
  platform: 'browser',
};

async function buildWorkers() {
  try {
    // Créer le dossier public/workers s'il n'existe pas
    const outputDir = path.join(process.cwd(), 'public', 'workers');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Compiler chaque worker
    for (const worker of workers) {
      const entryPoint = path.join(process.cwd(), 'src', 'workers', `${worker}.ts`);
      const outfile = path.join(outputDir, `${worker}.js`);

      await esbuild.build({
        ...baseConfig,
        entryPoints: [entryPoint],
        outfile,
      });

      console.log(`✅ Worker compilé: ${worker}`);
    }

    console.log('🎉 Tous les workers ont été compilés avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la compilation des workers:', error);
    process.exit(1);
  }
}

buildWorkers(); 