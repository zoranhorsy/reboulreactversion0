# Dossier Reports

Ce dossier contient les rapports générés par l'application Reboul.

## Structure

- `analytics/` : Rapports d'analyse
- `performance/` : Rapports de performance
- `audits/` : Rapports d'audit
- `build/` : Rapports de build
- `coverage/` : Rapports de couverture de tests

## Types de rapports

### Analytics
- Rapports de ventes
- Statistiques utilisateurs
- Métriques de performance
- Analyses de comportement

### Performance
- Rapports Lighthouse
- Métriques Core Web Vitals
- Analyses de performance
- Optimisations recommandées

### Audits
- Rapports de sécurité
- Audits de code
- Vérifications de conformité
- Analyses de qualité

## Génération des rapports

```bash
# Générer tous les rapports
npm run reports:generate

# Générer un type spécifique de rapport
npm run reports:analytics
npm run reports:performance
npm run reports:audit
```

## Bonnes pratiques

- Maintenir une structure claire des rapports
- Nommer les rapports de manière descriptive
- Inclure des timestamps dans les noms de fichiers
- Archiver les anciens rapports
- Documenter les anomalies importantes 