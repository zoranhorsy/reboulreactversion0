const fs = require('fs');

// Lire le fichier de log
fs.readFile('build_errors.txt', 'utf8', (err, data) => {
  if (err) {
    console.error("Erreur lors de la lecture du fichier:", err);
    return;
  }

  // Extraire les lignes contenant "error"
  const errors = data.split('\n').filter(line => line.toLowerCase().includes('error'));

  // Catégoriser les erreurs
  const categories = {};
  errors.forEach(error => {
    const category = error.includes('Module not found') ? 'Module not found' :
                     error.includes('Syntax error') ? 'Syntax error' :
                     'Other';
    categories[category] = (categories[category] || 0) + 1;
  });

  // Afficher les résultats
  console.log("Catégories d'erreurs :");
  console.log(categories);

  console.log("\nExemples d'erreurs :");
  console.log(errors.slice(0, 5).join('\n'));
});