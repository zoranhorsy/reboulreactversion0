# Migration vers la Configuration Centralisée

## Structure de la Configuration

La nouvelle configuration centralisée se trouve dans `src/config/` avec les fichiers suivants :
- `dev.ts` : Configuration pour l'environnement de développement
- `prod.ts` : Configuration pour l'environnement de production
- `index.ts` : Export de la configuration appropriée selon l'environnement

## Composants Migrés

Les composants suivants ont été migrés pour utiliser la nouvelle configuration :

1. `CloudinaryImage.tsx`
   - Utilise `config.debug` pour l'affichage des informations de débogage

2. `ImagePreview.tsx`
   - Utilise `config.debug` pour l'affichage des informations de débogage

3. `ProductForm.tsx`
   - Utilise `config.debug` pour l'affichage des informations de débogage

4. `HydrationDebugger.tsx`
   - Utilise `config.debug` pour le logging

5. `lib/nodemailer.ts`
   - Utilise `config.smtp` pour la configuration SMTP
   - Utilise `config.api.baseUrlPublic` pour les URLs

6. `AdminDashboard.tsx`
   - Utilise `config.api.baseUrl` pour les appels API

7. `checkout/page.tsx`
   - Utilise `config.debug` pour le mode test
   - Utilise `config.api.baseUrl` pour les appels API

## Composants Vérifiés

Les composants suivants ont été vérifiés et ne nécessitent pas de migration car ils sont des composants de présentation qui reçoivent leurs données via des props :

- `components/admin/Overview.tsx`
- `components/admin/RecentSales.tsx`

## Avantages de la Nouvelle Configuration

1. **Centralisation** : Toute la configuration est centralisée dans un seul endroit
2. **Typage** : Configuration entièrement typée avec TypeScript
3. **Environnements** : Séparation claire entre dev et prod
4. **Maintenance** : Plus facile à maintenir et à modifier
5. **Debug** : Un seul flag de debug pour toute l'application

## Comment Utiliser la Configuration

```typescript
import config from '@/config'

// Utilisation de la configuration
const apiUrl = config.api.baseUrl
const isDebug = config.debug
const smtpConfig = config.smtp
```

## Variables d'Environnement

Les variables d'environnement restent nécessaires dans les fichiers `.env` pour les différents environnements. La configuration utilise ces variables comme valeurs par défaut.

## Bonnes Pratiques

1. Toujours importer la configuration depuis `@/config`
2. Ne jamais utiliser directement les variables d'environnement
3. Utiliser les valeurs par défaut de la configuration
4. Ajouter de nouvelles configurations dans les fichiers appropriés
5. Maintenir la documentation à jour 