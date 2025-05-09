# Scripts Reboul

Ce dossier contient les scripts utilitaires pour le développement et le déploiement de l'application Reboul.

## Structure

- `deployment/` : Scripts de déploiement
- `database/` : Scripts de gestion de la base de données
- `maintenance/` : Scripts de maintenance
- `utils/` : Scripts utilitaires généraux

## Scripts disponibles

### Déploiement
- `deploy.sh` : Script principal de déploiement
- `backup.sh` : Sauvegarde de la base de données
- `rollback.sh` : Retour à une version précédente

### Base de données
- `migrate.sh` : Exécution des migrations
- `seed.sh` : Peuplement de la base de données
- `backup-db.sh` : Sauvegarde de la base de données

### Maintenance
- `cleanup.sh` : Nettoyage des fichiers temporaires
- `optimize.sh` : Optimisation des assets
- `check-health.sh` : Vérification de la santé du système

## Utilisation

Tous les scripts sont exécutables avec bash :

```bash
# Rendre un script exécutable
chmod +x scripts/nom-du-script.sh

# Exécuter un script
./scripts/nom-du-script.sh
```

## Bonnes pratiques

- Documenter les paramètres des scripts
- Inclure des commentaires explicatifs
- Gérer les erreurs de manière appropriée
- Maintenir les scripts à jour
- Tester les scripts avant de les utiliser en production

## Script d'ajout de chaussures Mercer

Le script `add-mercer-shoes.ts` permet d'ajouter 10 nouvelles chaussures de la marque "Mercer" dans la base de données.

### Prérequis

1. Installer la dépendance node-fetch :
```bash
npm install node-fetch@2 @types/node-fetch --save-dev
```

### Utilisation

1. Obtenez un token d'authentification en vous connectant en tant qu'administrateur sur l'application web.
2. Dans le navigateur, ouvrez les outils de développement (F12), allez dans "Application" > "Stockage local" et copiez la valeur de la clé "token".
3. Exécutez le script en passant le token en paramètre :

```bash
npx ts-node src/scripts/add-mercer-shoes.ts <token>
```

### Résultat

Le script va créer 10 chaussures Mercer dans la base de données avec différentes variantes, tailles et couleurs aléatoires.

Exemple de sortie :
```
Token d'authentification fourni: eyJhbGciOiJ...
Début de la création de 10 chaussures Mercer...
Création du produit: Mercer Amsterdam...
✅ Produit créé avec succès: Mercer Amsterdam (ID: 123)
Création du produit: Mercer Berlin...
✅ Produit créé avec succès: Mercer Berlin (ID: 124)
...
Opération terminée.
``` 