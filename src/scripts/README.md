# Scripts utilitaires

Ce dossier contient des scripts utilitaires pour le projet.

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