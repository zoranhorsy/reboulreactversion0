// Configuration des workers
export const WORKER_CONFIG = {
  // URLs des workers pour le navigateur
  browser: {
    filterWorker: '/workers/filterWorker.js',
    cartWorker: '/workers/cartWorker.js',
    priorityWorker: '/workers/priorityWorker.js'
  },
  
  // Chemins des workers pour Node.js
  node: {
    filterWorker: '../src/workers/filterWorker.ts',
    cartWorker: '../src/workers/cartWorker.ts',
    priorityWorker: '../src/workers/priorityWorker.ts'
  },

  // Configuration générale
  chunkSize: 1000, // Taille des fragments de données
  timeout: 10000 // Timeout en millisecondes
};

// Fonction pour créer un worker selon l'environnement
export function createWorker(workerPath: string) {
  if (typeof window === 'undefined') {
    // Environnement Node.js
    const { Worker } = require('worker_threads');
    return new Worker(workerPath);
  } else {
    // Environnement navigateur
    return new Worker(workerPath);
  }
}

// Fonction pour obtenir le chemin du worker selon l'environnement
export function getWorkerPath(workerName: keyof typeof WORKER_CONFIG.browser) {
  if (typeof window === 'undefined') {
    return WORKER_CONFIG.node[workerName];
  } else {
    return WORKER_CONFIG.browser[workerName];
  }
} 