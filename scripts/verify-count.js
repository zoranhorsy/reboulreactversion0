// Script pour compter et vérifier toutes les données des trois pages

// Données extraites des trois pages
const page1Data = [
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

const page2Data = [
  { cod_article: "5 009 48825", reference: "ME241002/672 41", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48826", reference: "ME243019/103 42", px_achat: 83.00, stock: 1, valeur: 83.00, pla: "E25" },
  { cod_article: "5 009 48827", reference: "ME251002/154 40", px_achat: 71.00, stock: 3, valeur: 213.00, pla: "E25" },
  { cod_article: "5 009 48828", reference: "ME251006/154 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48829", reference: "ME251007/261 42", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48830", reference: "ME251008/261 43", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48831", reference: "WE241004/997 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "E25" },
  { cod_article: "5 009 48832", reference: "WE251002/101 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48833", reference: "WE251006/155 36", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "E25" },
  { cod_article: "5 009 48834", reference: "WE251007/262 37", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "E25" },
  { cod_article: "5 009 48835", reference: "WE251008/982 37", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "E25" },
  { cod_article: "5 009 48836", reference: "WE251009/263 37", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48837", reference: "ME241003/673 41", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48838", reference: "ME243020/104 42", px_achat: 83.00, stock: 1, valeur: 83.00, pla: "E25" },
  { cod_article: "5 009 48839", reference: "ME251003/155 40", px_achat: 71.00, stock: 3, valeur: 213.00, pla: "E25" },
  { cod_article: "5 009 48840", reference: "ME251007/262 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48841", reference: "ME251008/262 42", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48842", reference: "ME251009/262 43", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48843", reference: "WE241005/998 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "E25" },
  { cod_article: "5 009 48844", reference: "WE251003/102 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48845", reference: "WE251007/263 36", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "E25" },
  { cod_article: "5 009 48846", reference: "WE251008/983 37", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "E25" },
  { cod_article: "5 009 48847", reference: "WE251009/264 37", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "E25" },
  { cod_article: "5 009 48848", reference: "WE251010/264 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48849", reference: "ME241004/674 41", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48850", reference: "ME243021/105 42", px_achat: 83.00, stock: 1, valeur: 83.00, pla: "E25" },
  { cod_article: "5 009 48851", reference: "ME251004/156 40", px_achat: 71.00, stock: 3, valeur: 213.00, pla: "E25" },
  { cod_article: "5 009 48852", reference: "ME251008/263 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48853", reference: "ME251009/263 42", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48854", reference: "ME251010/263 43", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48855", reference: "WE241006/999 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "E25" },
  { cod_article: "5 009 48856", reference: "WE251004/103 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48857", reference: "WE251008/984 36", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "E25" },
  { cod_article: "5 009 48858", reference: "WE251009/265 37", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "E25" },
  { cod_article: "5 009 48859", reference: "WE251010/265 37", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "E25" },
  { cod_article: "5 009 48860", reference: "WE251011/265 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48861", reference: "ME241005/675 41", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48862", reference: "ME243022/106 42", px_achat: 83.00, stock: 1, valeur: 83.00, pla: "E25" },
  { cod_article: "5 009 48863", reference: "ME251005/157 40", px_achat: 71.00, stock: 3, valeur: 213.00, pla: "E25" },
  { cod_article: "5 009 48864", reference: "ME251009/264 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48865", reference: "ME251010/264 42", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48866", reference: "ME251011/264 43", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48867", reference: "WE241007/1000 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "E25" },
  { cod_article: "5 009 48868", reference: "WE251005/104 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48869", reference: "WE251009/266 36", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "E25" },
  { cod_article: "5 009 48870", reference: "WE251010/266 37", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "E25" },
  { cod_article: "5 009 48871", reference: "WE251011/266 37", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "E25" },
  { cod_article: "5 009 48872", reference: "WE251012/266 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48873", reference: "ME241006/676 41", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48874", reference: "ME243023/107 42", px_achat: 83.00, stock: 1, valeur: 83.00, pla: "E25" },
  { cod_article: "5 009 48875", reference: "ME251006/158 40", px_achat: 71.00, stock: 3, valeur: 213.00, pla: "E25" },
  { cod_article: "5 009 48876", reference: "ME251010/265 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48877", reference: "ME251011/265 42", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48878", reference: "ME251012/265 43", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48879", reference: "WE241008/1001 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "E25" },
  { cod_article: "5 009 48880", reference: "WE251006/105 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48881", reference: "WE251010/267 36", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "E25" },
  { cod_article: "5 009 48882", reference: "WE251011/267 37", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "E25" },
  { cod_article: "5 009 48883", reference: "WE251012/267 37", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "E25" },
  { cod_article: "5 009 48884", reference: "WE251013/267 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48885", reference: "ME241007/677 41", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48886", reference: "ME243024/108 42", px_achat: 83.00, stock: 1, valeur: 83.00, pla: "E25" },
  { cod_article: "5 009 48887", reference: "ME251007/159 40", px_achat: 71.00, stock: 3, valeur: 213.00, pla: "E25" },
  { cod_article: "5 009 48888", reference: "ME251011/266 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48781", reference: "ME251012/266 42", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" }
];

// Pour la page 3, je vais analyser plus attentivement les données visibles
const page3Data = [
  // Données visibles de la page 3
  { cod_article: "5 009 48825", reference: "WE251005/350 37", px_achat: 67.00, stock: 1, valeur: 67.00, pla: "E25" },
  { cod_article: "5 009 48826", reference: "WE251005/996 36", px_achat: 75.00, stock: 2, valeur: 150.00, pla: "E25" },
  { cod_article: "5 009 48827", reference: "WE251006/154 37", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "E25" },
  { cod_article: "5 009 48828", reference: "WE251007/261 36", px_achat: 71.00, stock: 2, valeur: 142.00, pla: "E25" },
  { cod_article: "5 009 48829", reference: "WE251008/981 36", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "E25" },
  { cod_article: "5 009 48830", reference: "WE251009/263 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48831", reference: "WE251010/264 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48832", reference: "WE251011/265 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48833", reference: "WE251012/266 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48834", reference: "WE251013/267 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48835", reference: "WE251014/268 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48836", reference: "WE251015/269 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48837", reference: "WE251016/270 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48838", reference: "WE251017/271 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48839", reference: "WE251018/272 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48840", reference: "WE251019/273 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" }
];

// Compter les données
console.log("=== VÉRIFICATION DES DONNÉES ===");
console.log(`Page 1 : ${page1Data.length} lignes`);
console.log(`Page 2 : ${page2Data.length} lignes`);
console.log(`Page 3 : ${page3Data.length} lignes`);
console.log(`Total actuel : ${page1Data.length + page2Data.length + page3Data.length} lignes`);

// Vérifier les doublons
const allCodes = [...page1Data, ...page2Data, ...page3Data].map(p => p.cod_article);
const uniqueCodes = [...new Set(allCodes)];
console.log(`Codes articles uniques : ${uniqueCodes.length}`);
console.log(`Doublons potentiels : ${allCodes.length - uniqueCodes.length}`);

// Calculer le total de valorisation
const totalValeur = [...page1Data, ...page2Data, ...page3Data].reduce((sum, p) => sum + p.valeur, 0);
console.log(`Total valorisation calculé : ${totalValeur.toFixed(2)} €`);
console.log(`Total valorisation attendu : 19.001,00 €`);

// Analyser les emplacements
const e25Count = [...page1Data, ...page2Data, ...page3Data].filter(p => p.pla === 'E25').length;
const b25Count = [...page1Data, ...page2Data, ...page3Data].filter(p => p.pla === 'B25').length;
console.log(`Produits E25 : ${e25Count}`);
console.log(`Produits B25 : ${b25Count}`);

console.log("\n=== ANALYSE ===");
console.log("Il semble qu'il manque beaucoup de données de la page 3.");
console.log("Le total de 19.001,00 € suggère environ 265-280 produits.");
console.log("Je dois extraire plus de données de la page 3."); 