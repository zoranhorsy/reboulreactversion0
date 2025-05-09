# Dossier src

Ce dossier contient le code source principal de l'application Reboul, construit avec Next.js 14.

## Structure

- `app/` : Contient les routes et les pages de l'application (architecture App Router de Next.js)
- `components/` : Composants React réutilisables
- `lib/` : Utilitaires et fonctions d'aide
- `styles/` : Fichiers de style globaux
- `types/` : Définitions TypeScript
- `utils/` : Fonctions utilitaires

## Conventions

1. Utiliser le système de modules ES6 pour les imports/exports
2. Suivre les conventions de nommage de Next.js
3. Organiser les composants par fonctionnalité
4. Maintenir la séparation des préoccupations (separation of concerns)

## Bonnes pratiques

- Utiliser les composants serveur par défaut
- N'utiliser les composants client que lorsque nécessaire
- Suivre les patterns de Next.js pour l'optimisation des performances
- Maintenir une structure de dossiers cohérente 