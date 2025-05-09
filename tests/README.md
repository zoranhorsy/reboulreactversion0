# Tests Reboul

Ce dossier contient tous les tests de l'application Reboul.

## Structure

- `unit/` : Tests unitaires
- `integration/` : Tests d'intégration
- `e2e/` : Tests end-to-end
- `__mocks__/` : Mocks et fixtures
- `utils/` : Utilitaires de test

## Configuration

Les tests utilisent :
- Jest comme framework de test
- React Testing Library pour les tests de composants
- Cypress pour les tests E2E

## Exécution des tests

```bash
# Tous les tests
npm run test

# Tests unitaires uniquement
npm run test:unit

# Tests d'intégration
npm run test:integration

# Tests E2E
npm run test:e2e

# Tests en mode watch
npm run test:watch
```

## Conventions

1. Nommer les fichiers de test avec le suffixe `.test.ts` ou `.spec.ts`
2. Organiser les tests par fonctionnalité
3. Utiliser des descriptions claires et descriptives
4. Suivre le pattern AAA (Arrange, Act, Assert)

## Bonnes pratiques

- Maintenir une couverture de tests élevée
- Écrire des tests indépendants
- Utiliser des mocks appropriés
- Documenter les cas de test complexes
- Suivre les principes FIRST (Fast, Independent, Repeatable, Self-validating, Timely) 