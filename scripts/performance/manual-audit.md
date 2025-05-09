# Guide d'audit manuel des Web Vitals - Reboul

Puisque le script automatique rencontre des problèmes, voici un guide pour réaliser un audit manuel des pages prioritaires avec Lighthouse dans Chrome DevTools.

## Pages prioritaires à auditer

1. **Page d'accueil** - `http://localhost:3000`
2. **Catalogue** - `http://localhost:3000/catalogue`
3. **Page produit** - `http://localhost:3000/produit/1` (ou tout autre ID de produit valide)
4. **Checkout** - `http://localhost:3000/checkout`

## Procédure d'audit

Pour chaque page:

1. Ouvrir Chrome DevTools (F12 ou Cmd+Option+I sur Mac)
2. Aller dans l'onglet "Lighthouse"
3. Configurer les options:
   - **Categorie**: Performance, Accessibility, Best Practices, SEO
   - **Device**: Desktop ou Mobile selon les besoins
   - **Throttling**: Simulated Slow 4G & CPU 4x slowdown (pour tester dans des conditions réalistes)
4. Cliquer sur "Generate report"
5. Sauvegarder le rapport au format HTML (bouton ⋮ > "Save as HTML")
6. Noter les métriques clés dans le tableau ci-dessous

## Tableau des résultats

Après vos audits, complétez ce tableau avec les valeurs obtenues:

| Page | Performance | LCP | CLS | FID/TBT | TTI | Remarques |
|------|-------------|-----|-----|---------|-----|-----------|
| Accueil | % | s | | ms | s | |
| Catalogue | % | s | | ms | s | |
| Produit | % | s | | ms | s | |
| Checkout | % | s | | ms | s | |

## Métriques à surveiller

- **LCP (Largest Contentful Paint)**: Mesure le temps de chargement perçu
  - Bon: < 2.5s, Moyen: < 4.0s, Mauvais: > 4.0s

- **CLS (Cumulative Layout Shift)**: Mesure la stabilité visuelle
  - Bon: < 0.1, Moyen: < 0.25, Mauvais: > 0.25

- **FID/TBT (First Input Delay/Total Blocking Time)**: Mesure l'interactivité
  - FID - Bon: < 100ms, Moyen: < 300ms, Mauvais: > 300ms
  - TBT est utilisé comme approximation de FID dans Lighthouse

- **TTI (Time to Interactive)**: Mesure le moment où la page devient pleinement interactive
  - Bon: < 3.8s, Moyen: < 7.3s, Mauvais: > 7.3s

## Problèmes courants à identifier

### Performance

- Images non optimisées (formats, dimensions, compression)
- Ressources bloquant le rendu (CSS/JS)
- Code JavaScript inutilisé
- Trop de requêtes réseau
- Temps de réponse serveur lent

### Accessibilité

- Contraste insuffisant
- Attributs alt manquants sur les images
- Structure de titres incorrecte (h1, h2, etc.)
- Éléments interactifs sans noms accessibles

### Bonnes pratiques

- HTTPS non utilisé
- Erreurs JavaScript
- Images avec rapport d'aspect incorrect
- Vulnérabilités des bibliothèques

### SEO

- Meta description manquante
- Texte trop petit pour être lisible
- Pas de balises robots
- Liens sans texte descriptif

## Rapport d'audit

Une fois les audits terminés, créez un rapport détaillé avec:

1. **Résumé des performances**: Tableau des métriques par page
2. **Problèmes identifiés**: Liste priorisée des problèmes à résoudre
3. **Recommandations**: Actions concrètes pour améliorer chaque métrique
4. **Plan d'action**: Prochaines étapes avec priorités et responsables

Stockez les rapports HTML générés dans le dossier `reports/lighthouse/manual/` pour référence. 