# Tests des Web Workers - Reboul E-commerce

Ce dossier contient les tests des différents Web Workers utilisés dans l'application Reboul E-commerce.

## Structure

- `index.js` : Point d'entrée pour tous les tests
- `cart-worker.test.js` : Tests pour le cartWorker
- Autres fichiers de test à venir pour les autres workers

## Exécution

Pour exécuter les tests, utilisez la commande :

```bash
npm run test:workers
```

> **Note importante** : Ces tests ne peuvent pas être exécutés directement dans Node.js car les Web Workers ne sont pas supportés dans un environnement Node.js standard. Ils sont conçus pour être exécutés dans un navigateur.

## Page de test

Une page HTML de test est disponible à l'adresse :

```
http://localhost:3000/tests/workers.html
```

Cette page permet de tester interactivement chaque worker et de visualiser les résultats.

## Comment ajouter un nouveau test

1. Créez un nouveau fichier de test dans ce dossier (exemple : `nouveau-worker.test.js`)
2. Exportez les données de test et les résultats attendus
3. Importez ce fichier dans `index.js`
4. Mettez à jour la page HTML de test dans `public/tests/workers.html` pour inclure le nouveau test
5. Exécutez les tests pour vérifier leur bon fonctionnement

## Données de test

Les données de test pour chaque worker sont conçues pour couvrir différents scénarios et cas limites. 

Exemple pour le cartWorker :

```javascript
const testData = {
  basic: {
    // Données pour un test de panier standard
  },
  promos: [
    // Données pour tester différents codes promo
  ],
  shipping: [
    // Données pour tester différentes options de livraison
  ]
};
```

## Documentation complète

Pour une documentation plus détaillée sur les tests des workers et leur implémentation, consultez :

- [Guide des tests des workers](../../docs/workers-testing-guide.md)
- [Documentation technique du cartWorker](../../docs/cart-worker-implementation.md) 