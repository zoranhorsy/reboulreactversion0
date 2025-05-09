/**
 * Tests pour les Web Workers
 * 
 * Attention: Ces tests ne peuvent pas être exécutés directement dans Node.js
 * car les Web Workers ne sont pas supportés dans un environnement Node.js standard.
 * 
 * Pour tester les workers, utilisez la page HTML de test:
 * - Lancez le serveur de développement: npm run dev
 * - Accédez à http://localhost:3000/tests/workers.html
 */

const cartWorkerTests = require('./cart-worker.test');

// Exporter les tests
module.exports = {
  cartWorker: cartWorkerTests,
  runAllTests: () => {
    console.log("Pour tester les workers, utilisez la page HTML de test:");
    console.log("- Lancez le serveur de développement: npm run dev");
    console.log("- Accédez à http://localhost:3000/tests/workers.html");
  }
}; 