# Analyse et Organisation de la Structure du Projet Reboul

## État Actuel

### Structure Principale
- `/backend` : Contient la partie backend de l'application
- `/src` : Contient le code frontend (Next.js)
- `/public` : Fichiers statiques
- `/docs` : Documentation
- `/tests` : Tests unitaires et d'intégration
- `/scripts` : Scripts utilitaires
- `/data` : Données de l'application

### Fichiers de Configuration
- Configuration Next.js (`next.config.js`)
- Configuration TypeScript (`tsconfig.json`)
- Configuration ESLint (`.eslintrc.js`)
- Configuration Tailwind (`tailwind.config.ts`)
- Configuration Docker (`Dockerfile`, `docker-compose.yml`)

## Problèmes Identifiés

1. **Structure Frontend/Backend**
   - Manque de séparation claire entre frontend et backend
   - Organisation interne du dossier `src` pourrait être améliorée

2. **Fichiers Temporaires et Inutiles**
   - Plusieurs fichiers inutiles ou temporaires étaient présents à la racine (voir section Nettoyage)

3. **Duplication de Configuration**
   - Double configuration ESLint (corrigé, on garde `.eslintrc.js`)

## Nettoyage effectué à la racine

- Fichiers supprimés :
  - `node`
  - `reboul-store@0.1.0`
  - `type-errors.txt`
  - `test_product.json`
  - `test_output.json`
  - `token.txt`
  - `.eslintrc.json`
  - `function_calls>`
  - `components.json`
  - `.DS_Store` (à supprimer manuellement si encore présent)
- Fichier déplacé :
  - `get_token.js` déplacé dans `/scripts`

## Fichiers restants à vérifier
- `next-cloudinary.config.js` / `next-cloudinary.d.ts` : à garder si Cloudinary utilisé
- `jest.config.js` / `jest.setup.js` : à garder si Jest utilisé
- `.npmrc` : à garder si config npm spécifique
- Les autres fichiers sont standards ou nécessaires

## Recommandations

### 1. Réorganisation des Dossiers
```
/
├── src/              # Garder la structure Next.js standard
│   ├── components/   # Composants React
│   ├── pages/       # Pages Next.js
│   ├── styles/      # Styles CSS/SCSS
│   ├── utils/       # Utilitaires frontend
│   ├── hooks/       # Custom React hooks (optionnel)
│   └── lib/         # Fonctions d'accès aux API, helpers (optionnel)
├── backend/         # Garder tel quel
├── shared/         # Code partagé entre frontend et backend
├── docs/           # Documentation
├── tests/          # Tests
└── scripts/        # Scripts utilitaires
```

### 2. Nettoyage
- Supprimer les fichiers vides et temporaires (fait)
- Fusionner les configurations ESLint (fait)
- Déplacer les fichiers de test dans le dossier approprié

### 3. Documentation
- Créer un README.md dans chaque dossier principal
- Documenter la structure dans le README principal

### 4. Configuration
- Centraliser les configurations dans un dossier `config/`
- Séparer les configurations de développement et de production

## Plan d'Action

1. Nettoyer les fichiers inutiles (fait)
2. Réorganiser la structure interne du dossier `src`
3. Mettre à jour la documentation
4. Centraliser les configurations

## Fichiers à Supprimer (rappel)
- `.DS_Store` (à supprimer manuellement si encore présent)

---

## ⚡️ Bonnes pratiques pour le frontend Next.js & la configuration Vercel

### Organisation recommandée du frontend (`/src`)
- Garder `/src/pages` pour les pages Next.js (obligatoire)
- Créer `/src/components`, `/src/styles`, `/src/utils`, `/src/hooks`, `/src/lib` selon les besoins
- Ne pas déplacer `/pages` en dehors de `/src`

### Configuration Vercel
- **Aucune modification nécessaire** si le frontend reste dans `/src` ou à la racine
- Si le frontend est déplacé (ex : `/frontend`), renseigner ce chemin dans "Root Directory" sur Vercel
- Les commandes de build/install/output sont gérées automatiquement par Vercel pour Next.js

### Points d'attention
- Vérifier les variables d'environnement dans l'interface Vercel si besoin
- Nettoyer régulièrement les fichiers inutiles à la racine
- Documenter la structure dans le README

### Quand modifier la config Vercel ?
- Uniquement si la racine du frontend change ou si tu utilises une structure non standard

---

**Résumé** :
- Organise bien `/src` (garde `/pages` dedans)
- Laisse la config Vercel par défaut
- Modifie la config Vercel seulement si tu changes la racine du frontend 