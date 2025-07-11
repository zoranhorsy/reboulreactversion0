# 🧪 Tests Reboul

Ce dossier contient tous les tests unitaires et d'intégration de l'application Reboul, organisés par fonctionnalité.

## 📁 Structure

```
tests/
├── contexts/           # Tests des contextes React
│   └── AuthContext.test.tsx
├── panier/            # Tests du panier et checkout
│   ├── panier.test.tsx
│   └── simple.test.tsx
├── inscription/       # Tests d'inscription et authentification
│   └── inscription.test.tsx
└── workers/           # Tests des Web Workers
    └── ...
```

## 🚀 Lancer les tests

```bash
# Tous les tests
npm test

# Tests spécifiques
npm test -- tests/panier/
npm test -- tests/contexts/
npm test -- tests/inscription/

# Tests en mode watch
npm test:watch

# Tests avec coverage
npm test -- --coverage
```

## 📋 Types de tests

### **🔐 Tests d'authentification**
- `contexts/AuthContext.test.tsx` : Contexte d'authentification
- `inscription/inscription.test.tsx` : Inscription frontend ↔ Railway backend

### **🛒 Tests du panier**
- `panier/panier.test.tsx` : Composant LoginRequiredPopover
- `panier/simple.test.tsx` : Logique métier du panier (calculs, validation)

### **⚡ Tests des Workers**
- `workers/` : Tests des Web Workers pour les performances

## ✅ Bonnes pratiques

1. **Nommage** : `[Composant/Feature].test.tsx`
2. **Organisation** : Un test par fonctionnalité principale
3. **Mocks** : Utiliser `jest.mock()` pour les dépendances externes
4. **Coverage** : Viser 80%+ de couverture de code

## 🎯 Commandes utiles

```bash
# Tester l'inscription complète (frontend + backend)
npm test -- tests/inscription/inscription.test.tsx

# Tester la logique du panier
npm test -- tests/panier/simple.test.tsx

# Tester l'authentification
npm test -- tests/contexts/AuthContext.test.tsx
```

## 🔧 Configuration

Les tests utilisent :
- **Jest** : Framework de test
- **React Testing Library** : Tests de composants React
- **@testing-library/jest-dom** : Matchers personnalisés
- **axios** : Tests d'API (Railway backend)

Voir `jest.config.js` pour la configuration complète. 