const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Lire le fichier JSON
const jsonPath = path.join(__dirname, '../data/mercer-stock-valuation-30-07-25.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Préparer les données pour Excel
const excelData = jsonData.produits.map(produit => ({
  'Code Article': produit.cod_article,
  'Référence': produit.reference,
  'Prix Achat (€)': produit.px_achat,
  'Stock': produit.stock,
  'Valeur (€)': produit.valeur,
  'Emplacement': produit.pla
}));

// Créer un nouveau workbook
const workbook = XLSX.utils.book_new();

// Créer une feuille avec les données
const worksheet = XLSX.utils.json_to_sheet(excelData);

// Définir la largeur des colonnes
const columnWidths = [
  { wch: 15 }, // Code Article
  { wch: 20 }, // Référence
  { wch: 15 }, // Prix Achat
  { wch: 10 }, // Stock
  { wch: 15 }, // Valeur
  { wch: 12 }  // Emplacement
];
worksheet['!cols'] = columnWidths;

// Ajouter la feuille au workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Mercer 30-07-25');

// Ajouter des informations de métadonnées
const metadataSheet = XLSX.utils.aoa_to_sheet([
  ['INFORMATIONS GÉNÉRALES'],
  [''],
  ['Date', jsonData.metadata.date],
  ['Heure', jsonData.metadata.heure],
  ['Marque', jsonData.metadata.marque],
  ['Genre', jsonData.metadata.genre],
  [''],
  ['TOTAUX'],
  ['Total Général', jsonData.metadata.total_general + ' €'],
  ['Total Genre', jsonData.metadata.total_genre + ' €'],
  ['Total Marque', jsonData.metadata.total_marque + ' €']
]);

// Définir la largeur des colonnes pour la feuille métadonnées
metadataSheet['!cols'] = [{ wch: 20 }, { wch: 20 }];

// Ajouter la feuille métadonnées
XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Informations');

// Sauvegarder le fichier Excel
const outputPath = path.join(__dirname, '../data/mercer-stock-valuation-30-07-25.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log(`Fichier Excel créé avec succès : ${outputPath}`);
console.log(`Nombre de produits : ${excelData.length}`);
console.log(`Total de la valorisation : ${jsonData.metadata.total_general} €`); 