# Script SQL pour l'ajout de chaussures Mercer

Ce script SQL vous permet d'ajouter directement des chaussures de la marque Mercer dans la base de données, sans passer par l'API ni avoir besoin d'authentification.

> **Note importante** : Les scripts SQL ont été déplacés dans le dossier `backend/scripts/sql/produits/` pour une meilleure organisation.
> Veuillez vous référer à la documentation dans ce dossier pour plus d'informations.

## Avantages par rapport au script Node.js

- Ne nécessite pas d'authentification (pas de token requis)
- Pas besoin d'installer des dépendances supplémentaires
- Opération en une seule transaction (tout réussit ou tout échoue)
- Plus rapide à exécuter
- Peut être exécuté directement dans votre outil de gestion de base de données

## Comment l'utiliser

1. Connectez-vous à votre base de données PostgreSQL en utilisant psql ou un outil comme pgAdmin
2. Ouvrez le fichier `backend/scripts/sql/produits/add-mercer-shoes.sql`
3. Exécutez le script dans votre base de données

### Exemple avec psql

```bash
# Si vous avez les identifiants et l'hôte de la base de données
psql -h votre_hote -U votre_utilisateur -d votre_base -f backend/scripts/sql/produits/add-mercer-shoes.sql
```

### Avec Railway

Si votre base de données est hébergée sur Railway:

1. Allez dans le dashboard Railway
2. Sélectionnez votre projet et votre base de données
3. Ouvrez la section "SQL" ou "Query"
4. Copiez-collez le contenu du fichier `backend/scripts/sql/produits/add-mercer-shoes.sql`
5. Exécutez le script

## Personnalisation

Si vous souhaitez modifier le script:

- Les IDs des marques et catégories sont définis au début du script
- Vous pouvez modifier le nombre de produits à insérer en changeant la variable `nombre_produits`
- Vous pouvez ajouter d'autres variantes ou tags selon vos besoins

## Notes importantes

- Ce script utilise un bloc PL/pgSQL avec des variables déclarées
- Il utilise `RETURNING id INTO product_id` pour récupérer l'ID généré pour chaque produit
- Les timestamps sont générés avec `NOW()`
- Les données sont cohérentes avec la structure de la base de données et les contraintes 