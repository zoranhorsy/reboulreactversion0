// Script pour vérifier la répartition E25 vs B25

// Données du fichier Excel créé
const data = [
  // PAGE 1 (57 lignes)
  { cod_article: "5 009 48673", reference: "ME241001/671 41", px_achat: 69.00, stock: 1, valeur: 69.00, pla: "E25" },
  { cod_article: "5 009 48710", reference: "ME243018/102 42", px_achat: 83.00, stock: 2, valeur: 166.00, pla: "E25" },
  { cod_article: "5 009 48889", reference: "ME251001/153 40", px_achat: 71.00, stock: 3, valeur: 213.00, pla: "E25" },
  { cod_article: "5 009 48890", reference: "ME251005/997 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48891", reference: "ME251006/154 42", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48912", reference: "ME251007/261 43", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 49010", reference: "WE241003/997 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "E25" },
  { cod_article: "5 009 49011", reference: "WE251001/101 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 49012", reference: "WE251005/350 37", px_achat: 67.00, stock: 1, valeur: 67.00, pla: "E25" },
  { cod_article: "5 009 49013", reference: "WE251005/996 36", px_achat: 75.00, stock: 2, valeur: 150.00, pla: "E25" },
  { cod_article: "5 009 49014", reference: "WE251006/154 37", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "E25" },
  { cod_article: "5 009 49015", reference: "WE251007/261 36", px_achat: 71.00, stock: 2, valeur: 142.00, pla: "E25" },
  { cod_article: "5 009 49016", reference: "WE251008/981 36", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "E25" },
  { cod_article: "5 009 48928", reference: "ME243018/103 42", px_achat: 83.00, stock: 3, valeur: 249.00, pla: "B25" },
  { cod_article: "5 009 48929", reference: "ME251001/154 40", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "B25" },
  { cod_article: "5 009 48930", reference: "ME251005/998 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "B25" },
  { cod_article: "5 009 48949", reference: "WE241004/998 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "B25" },
  { cod_article: "5 009 48950", reference: "WE251002/102 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "B25" },
  { cod_article: "5 009 48951", reference: "WE251006/155 37", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "B25" },
  { cod_article: "5 009 48952", reference: "WE251007/262 36", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "B25" },
  { cod_article: "5 009 48953", reference: "WE251008/982 36", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "B25" },
  { cod_article: "5 009 48954", reference: "WE251009/263 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "B25" }
];

// Analyser les emplacements
const e25Products = data.filter(p => p.pla === 'E25');
const b25Products = data.filter(p => p.pla === 'B25');

console.log("=== VÉRIFICATION E25 vs B25 ===");
console.log(`Total produits : ${data.length}`);
console.log(`Produits E25 : ${e25Products.length}`);
console.log(`Produits B25 : ${b25Products.length}`);

console.log("\n=== PRODUITS B25 ===");
b25Products.forEach(p => {
  console.log(`Code: ${p.cod_article}, Réf: ${p.reference}, Prix: ${p.px_achat}€, Stock: ${p.stock}, Valeur: ${p.valeur}€`);
});

console.log("\n=== PRODUITS E25 (premiers 10) ===");
e25Products.slice(0, 10).forEach(p => {
  console.log(`Code: ${p.cod_article}, Réf: ${p.reference}, Prix: ${p.px_achat}€, Stock: ${p.stock}, Valeur: ${p.valeur}€`);
});

// Vérifier si les codes B25 correspondent aux images
console.log("\n=== VÉRIFICATION DES IMAGES ===");
console.log("D'après les images, les produits B25 devraient être :");
console.log("- 5 009 48928 (ME243018/103 42)");
console.log("- 5 009 48929 (ME251001/154 40)");
console.log("- 5 009 48930 (ME251005/998 46)");
console.log("- 5 009 48949 (WE241004/998 36)");
console.log("- 5 009 48950 (WE251002/102 37)");
console.log("- 5 009 48951 (WE251006/155 37)");
console.log("- 5 009 48952 (WE251007/262 36)");
console.log("- 5 009 48953 (WE251008/982 36)");
console.log("- 5 009 48954 (WE251009/263 36)");

// Vérifier si tous les autres sont E25
const allE25 = data.filter(p => p.pla === 'E25').length;
const allB25 = data.filter(p => p.pla === 'B25').length;
const total = data.length;

console.log(`\n=== RÉSULTAT FINAL ===`);
console.log(`Total : ${total}`);
console.log(`E25 : ${allE25}`);
console.log(`B25 : ${allB25}`);
console.log(`Vérification : ${allE25 + allB25} === ${total} ? ${allE25 + allB25 === total}`); 