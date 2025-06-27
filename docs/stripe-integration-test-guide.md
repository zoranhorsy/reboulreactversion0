# Guide de Test - Intégration Stripe → Reboul

Ce guide vous permet de vérifier que l'intégration entre Stripe et votre compte Reboul fonctionne correctement.

## 🎯 Objectif

Vérifier que lorsqu'une commande est passée via Stripe, elle s'affiche bien dans le compte utilisateur Reboul correspondant.

## 📋 Prérequis

- Backend et base de données déployés sur Railway
- Webhooks Stripe configurés et actifs
- Un compte utilisateur Reboul existant
- Produits disponibles dans le catalogue

## 🔧 Tests Automatiques

### 1. Test d'Association des Commandes

```bash
cd backend
node test-stripe-association.js
```

**Résultats attendus :**
- ✅ Taux d'association élevé (>85%)
- ✅ Peu ou pas de commandes orphelines
- ✅ Utilisateurs avec commandes visibles

### 2. Test d'Intégration Complète

```bash
cd backend
node test-stripe-integration.js --cleanup
```

**Résultats attendus :**
- ✅ Commande créée et visible côté utilisateur
- ✅ Structure des données correcte
- ✅ Emails présents dans shipping_info et payment_data
- ✅ Simulation frontend réussie

### 3. Association des Commandes Orphelines

```bash
cd backend
node test-stripe-association.js --associate
```

**Utilité :** Associe automatiquement les commandes sans user_id aux utilisateurs correspondants.

## 🧪 Test Manuel - Processus Complet

### Étape 1: Préparer le Test
1. Connectez-vous à votre compte Reboul avec un email spécifique (ex: `test@exemple.com`)
2. Notez l'état actuel de vos commandes dans "Mon Compte" → "Commandes"

### Étape 2: Passer une Commande via Stripe
1. Ajoutez un produit au panier
2. Procédez au checkout
3. **Important:** Utilisez le même email que votre compte Reboul
4. Completez le paiement via Stripe

### Étape 3: Vérifier l'Affichage
1. Retournez dans "Mon Compte" → "Commandes"
2. Actualisez la page (bouton "Actualiser")
3. **Vérifiez que la nouvelle commande apparaît:**
   - ✅ Numéro de commande correct
   - ✅ Montant correct
   - ✅ Statut "En cours" ou "Processing"
   - ✅ Paiement marqué comme "Payé"
   - ✅ Détails des produits visibles

## 🔍 Points de Vérification

### Dans l'Interface Utilisateur
- [ ] La commande apparaît dans la liste
- [ ] Le statut de paiement est correct
- [ ] Les détails de la commande sont complets
- [ ] L'email de commande correspond à celui du compte
- [ ] Les produits et quantités sont exacts

### Côté Admin (optionnel)
- [ ] Commande visible dans l'interface admin
- [ ] Association utilisateur correcte
- [ ] Données Stripe présentes

## 🚨 Problèmes Courants et Solutions

### Commande non visible
**Problème :** La commande Stripe n'apparaît pas dans le compte Reboul

**Solutions :**
1. Vérifiez que l'email utilisé est identique
2. Actualisez la page des commandes
3. Exécutez l'association automatique:
   ```bash
   node test-stripe-association.js --associate
   ```

### Webhooks non reçus
**Problème :** Les webhooks Stripe ne sont pas traités

**Vérifications :**
1. URL webhook correcte dans Stripe Dashboard
2. Endpoint accessible: `https://votre-backend.railway.app/api/stripe/webhook`
3. Events activés: `checkout.session.completed`, `payment_intent.succeeded`

### Données manquantes
**Problème :** Informations incomplètes dans la commande

**Solutions :**
1. Vérifier la capture des données lors du checkout
2. S'assurer que l'email est bien transmis à Stripe
3. Contrôler les métadonnées dans les sessions Stripe

## 📊 Métriques de Succès

Une intégration réussie devrait montrer :
- **Taux d'association :** >90%
- **Délai d'affichage :** <5 minutes
- **Données complètes :** Email, montant, produits, statut
- **Cohérence :** Informations identiques entre Stripe et Reboul

## 🎉 Validation Finale

L'intégration est considérée comme réussie si :

1. ✅ **Association automatique :** Les commandes s'associent automatiquement
2. ✅ **Affichage immédiat :** Les commandes apparaissent rapidement côté utilisateur
3. ✅ **Données cohérentes :** Toutes les informations sont correctes
4. ✅ **Emails envoyés :** Confirmations automatiques fonctionnelles
5. ✅ **Interface utilisateur :** Navigation fluide et informations claires

## 📞 Support

En cas de problème persistant :
1. Consultez les logs du backend Railway
2. Vérifiez les webhooks dans Stripe Dashboard
3. Exécutez les tests automatiques pour diagnostic

---

**Dernière mise à jour :** Mai 2025  
**Version :** 1.0  
**Status :** ✅ Intégration validée 