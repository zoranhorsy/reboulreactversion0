# Outils de Mesure des Web Vitals - Reboul E-commerce

Ce dossier contient des scripts et utilitaires pour auditer, mesurer et surveiller les métriques Web Vitals pour l'application Reboul.

## Contexte

Selon notre roadmap, l'optimisation des métriques Web Vitals est une priorité pour améliorer l'expérience utilisateur. Ces outils nous permettent de:

1. Auditer les performances du site
2. Collecter des métriques utilisateur réelles (RUM)
3. Analyser les données et identifier les problèmes

## Métriques Web Vitals

Nous suivons les métriques principales:

| Métrique | Description | Bon | Moyen | Mauvais |
|----------|-------------|-----|-------|---------|
| LCP (Largest Contentful Paint) | Chargement perçu | < 2.5s | < 4.0s | > 4.0s |
| FID (First Input Delay) | Interactivité | < 100ms | < 300ms | > 300ms |
| CLS (Cumulative Layout Shift) | Stabilité visuelle | < 0.1 | < 0.25 | > 0.25 |
| INP (Interaction to Next Paint) | Réactivité | < 200ms | < 500ms | > 500ms |
| TTFB (Time to First Byte) | Temps de réponse serveur | < 800ms | < 1800ms | > 1800ms |

## Scripts disponibles

### 1. Audit Lighthouse (`lighthouse-audit.js`)

Script automatisé pour auditer les pages principales avec Lighthouse.

**Installation des dépendances:**
```bash
npm install --save-dev lighthouse chrome-launcher
```

**Exécution:**
```bash
node src/scripts/performance/lighthouse-audit.js
```

**Fonctionnalités:**
- Audit automatisé des pages principales (accueil, catalogue, produit, checkout)
- Génération de rapports HTML détaillés
- Extraction des métriques Web Vitals
- Création d'un résumé JSON des résultats

Les rapports sont enregistrés dans le dossier `/reports/lighthouse/`.

### 2. Mesure RUM (`web-vitals-reporter.js`)

Collecte des métriques Web Vitals auprès des utilisateurs réels (Real User Monitoring).

**Comment l'utiliser:**
Ce module est déjà intégré dans notre application. Il collecte automatiquement les métriques des utilisateurs et les envoie à notre API.

**Points d'intégration:**
- `src/app/layout.tsx` - intégration du reporter
- `src/app/api/analytics/web-vitals/route.ts` - endpoint pour stocker les données

### 3. Dashboard d'analyse (`WebVitalsAnalyzer.tsx`)

Composant de visualisation des données Web Vitals accessible dans l'administration.

**Accès:**
Le dashboard est accessible à l'adresse: `/admin/performance`

**Fonctionnalités:**
- Visualisation des métriques par page
- Analyse des tendances
- Détection automatique des problèmes
- Export des données

## Comment utiliser ces outils

### Audit régulier

Nous recommandons d'exécuter l'audit Lighthouse:
- Après chaque déploiement majeur
- Mensuellement pour suivre l'évolution des performances
- Lors du développement de nouvelles fonctionnalités impactantes

### Analyse des données utilisateur

Consultez régulièrement le dashboard d'administration pour:
- Identifier les points faibles basés sur les données utilisateur réelles
- Suivre l'impact des optimisations
- Détecter les problèmes spécifiques à certains appareils/navigateurs

## Bonnes pratiques d'optimisation

1. **Optimisation des images**
   - Utiliser des formats modernes (WebP/AVIF)
   - Implémenter le lazy loading
   - Précharger les images critiques

2. **Minimisation du CLS**
   - Réserver l'espace pour les éléments dynamiques
   - Définir les dimensions des médias
   - Éviter d'insérer du contenu au-dessus du contenu existant

3. **Amélioration du LCP**
   - Optimiser le chemin critique de rendu
   - Minifier JS/CSS
   - Utiliser un CDN
   - Implémenter le code splitting

4. **Réduction du FID/INP**
   - Réduire le temps de blocage du thread principal
   - Différer les scripts non critiques
   - Optimiser les gestionnaires d'événements 