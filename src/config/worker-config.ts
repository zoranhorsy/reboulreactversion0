// Configuration des travailleurs Web
export const WORKER_CONFIG = {
  // Chemins des workers pour la production
  workerPaths: {
    filterWorker: "/workers/filterWorker.js",
    searchWorker: "/workers/searchWorker.js",
  },
  // Chemins des workers pour le développement
  devWorkerPaths: {
    filterWorker: "../src/workers/filterWorker.ts",
    searchWorker: "../src/workers/searchWorker.ts",
  },
  // Taille du fragment pour les gros lots de données
  chunkSize: 500,
  // Délai d'attente avant de déclarer un timeout (en ms)
  timeout: 2000, // 2 secondes pour un basculement ultra-rapide vers le filtrage local
  // Délai de mise en cache des résultats (en ms)
  cacheTime: 5000,
};

// Fonction pour créer un worker selon l'environnement
export function createWorker(workerPath: string) {
  if (typeof window === "undefined") {
    // Environnement Node.js
    const { Worker } = require("worker_threads");
    return new Worker(workerPath);
  } else {
    // Environnement navigateur
    return new Worker(workerPath);
  }
}

// Fonction pour obtenir le chemin du worker selon l'environnement
export function getWorkerPath(
  workerName: keyof typeof WORKER_CONFIG.workerPaths,
) {
  if (process.env.NODE_ENV === "development") {
    return WORKER_CONFIG.devWorkerPaths[workerName];
  } else {
    return WORKER_CONFIG.workerPaths[workerName];
  }
}
