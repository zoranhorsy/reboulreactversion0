# Guide de Test des Web Workers - Reboul E-commerce

Ce document décrit comment tester les Web Workers utilisés dans l'application Reboul E-commerce.

## Présentation des Web Workers

Les Web Workers sont utilisés pour effectuer des calculs intensifs sans bloquer le thread principal, améliorant ainsi l'expérience utilisateur. Voici les workers implémentés dans notre application :

1. **cartWorker** : Calcule les totaux du panier, applique les codes promo et gère les options de livraison
2. **filterWorker** : Filtre et trie les produits dans le catalogue
3. **imageWorker** : Traite les images (redimensionnement, filtres, etc.)
4. **priorityWorker** : Gère les priorités d'exécution des tâches

## Exécution des tests

Les tests des Web Workers ne peuvent pas être exécutés directement dans Node.js car les Web Workers sont une fonctionnalité du navigateur. Pour les tester, nous utilisons une page HTML spéciale.

### Option 1 : Utiliser le script de test

La méthode la plus simple est d'utiliser le script de test dédié :

```bash
npm run test:workers
```

Ce script :
1. Vérifie si le serveur Next.js est en cours d'exécution
2. Compile les workers si nécessaire
3. Démarre le serveur s'il n'est pas déjà en cours d'exécution
4. Ouvre automatiquement la page de test dans votre navigateur

### Option 2 : Exécution manuelle

Si vous préférez une approche manuelle :

1. Assurez-vous que les workers sont compilés :
   ```bash
   npm run build:workers
   ```

2. Démarrez le serveur de développement (s'il n'est pas déjà en cours d'exécution) :
   ```bash
   npm run dev
   ```

3. Ouvrez votre navigateur et accédez à :
   ```
   http://localhost:3000/tests/workers.html
   ```

## Structure des tests

### Tests du cartWorker

Le cartWorker est testé avec plusieurs scénarios :

1. **Test de base** : Vérifie le calcul du total du panier avec plusieurs articles et un code promo
2. **Tests des codes promo** : Teste tous les codes promo disponibles avec différents montants
3. **Tests des options de livraison** : Vérifie les frais de livraison pour différentes méthodes et montants

#### Codes promo supportés

| Code | Description | Effet |
|------|-------------|-------|
| WELCOME10 | Code de bienvenue | 10% de réduction sur le total |
| SUMMER20 | Promotion d'été | 20% de réduction sur le total |
| REBOUL25 | Code exclusif | 25% de réduction sur le total |
| FREE50 | Livraison gratuite | Frais de livraison offerts, minimum 50€ d'achat |

#### Options de livraison

| Méthode | Description | Frais | Livraison gratuite à partir de |
|---------|-------------|-------|--------------------------------|
| standard | Livraison standard (3-5 jours) | 8€ | 50€ |
| express | Livraison express (1-2 jours) | 15€ | 100€ |
| pickup | Retrait en magasin | Gratuit | 0€ |

### Autres Workers

Les tests pour les autres workers sont en cours d'implémentation et seront ajoutés prochainement.

## Développement de nouveaux tests

Pour ajouter des tests pour un nouveau worker, suivez ces étapes :

1. Créez un fichier de test dans le dossier `tests/workers/` (exemple : `nouveau-worker.test.js`)
2. Ajoutez les données de test et les résultats attendus
3. Mettez à jour la page HTML de test dans `public/tests/workers.html` pour inclure les nouveaux tests
4. Exécutez les tests pour vérifier leur bon fonctionnement

## Dépannage

### Le serveur ne démarre pas

Si le serveur Next.js ne démarre pas correctement, essayez :

```bash
npm run dev
```

Puis ouvrez manuellement `http://localhost:3000/tests/workers.html` dans votre navigateur.

### Les tests échouent

Si les tests échouent :

1. Vérifiez que les workers sont correctement compilés avec `npm run build:workers`
2. Inspectez la console du navigateur pour les erreurs spécifiques
3. Vérifiez que le worker testé est bien présent dans le dossier `public/workers/`

### Problèmes avec la compilation des workers

Si la compilation des workers échoue :

1. Vérifiez les erreurs dans la sortie de la commande `npm run build:workers`
2. Assurez-vous que le fichier source du worker est correct et ne contient pas d'erreurs
3. Vérifiez que toutes les dépendances sont installées 