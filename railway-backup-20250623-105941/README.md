# Backup Railway Reboul - 2025-06-23

## Contenu du backup

- `sql/schema.sql` : Schéma complet de la base de données
- `*.csv` : Données de toutes les tables
- `import-to-local.sh` : Script d'import vers la base locale

## Utilisation

1. Démarrer l'environnement Docker :
   ```bash
   docker-compose up -d
   ```

2. Importer les données :
   ```bash
   cd railway-backup-20250623-105941
   ./import-to-local.sh
   ```

3. Modifier les URLs dans le frontend pour pointer vers localhost:5001

## Fichiers modifiés pour le mode local

Voir les scripts dans le dossier parent :
- `switch-to-local.sh` : Basculer vers le local
- `switch-to-railway.sh` : Retour vers Railway
