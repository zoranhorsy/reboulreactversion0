#!/bin/bash

# Script de déploiement pour Reboul React Version 0

echo "🚀 Démarrage du déploiement de Reboul React..."

# Vérifier que les changements sont commités
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️ Il y a des changements non commités. Veuillez les commiter ou les stasher avant le déploiement."
  exit 1
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Vérifier les types
echo "🔍 Vérification des types..."
npm run typecheck

# Linter
echo "🧹 Vérification du code avec ESLint..."
npm run lint

# Construire l'application
echo "🏗️ Construction de l'application..."
npm run build

# Si toutes les étapes précédentes ont réussi
if [ $? -eq 0 ]; then
  echo "✅ La construction de l'application a réussi!"
  
  # Créer un dossier de distribution si nécessaire
  echo "📁 Préparation du dossier de distribution..."
  mkdir -p dist
  
  # Copier les fichiers nécessaires
  echo "📂 Copie des fichiers dans le dossier de distribution..."
  cp -r .next dist/
  cp -r public dist/
  cp package.json dist/
  cp package-lock.json dist/
  cp next.config.js dist/
  
  echo "✨ Déploiement prêt! Les fichiers sont dans le dossier 'dist'."
  echo "Pour déployer sur votre serveur, utilisez la commande:"
  echo "  rsync -avz --delete dist/ utilisateur@serveur:/chemin/vers/destination/"
else
  echo "❌ La construction de l'application a échoué!"
  exit 1
fi 