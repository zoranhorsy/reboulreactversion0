# ⚡ Aide-Mémoire Stripe - Reboul + The Corner

## 🎯 Concept Principal
**Un seul paiement client → Répartition automatique entre les magasins**

## 🔄 Workflow Résumé

### 1. Création commande (Statut "Attente")
```bash
POST /api/checkout/create-cart-session
→ Session Stripe créée
→ Argent RÉSERVÉ (pas prélevé)
→ PaymentIntent: requires_capture
```

### 2. Finalisation (Statut "En cours")  
```bash
POST /api/stripe/capture-payment
→ Argent PRÉLEVÉ
→ Transfert automatique → The Corner
→ PaymentIntent: succeeded
```

## 🏪 Détection des Magasins
- **Reboul** : ID produit > 50 (ex: 55-42-Gold)
- **The Corner** : ID produit ≤ 50 (ex: 2-Bleu-S)

## 🔧 APIs Essentielles

| Endpoint | Usage | Quand |
|----------|-------|--------|
| `/api/checkout/create-cart-session` | Créer session | Client valide panier |
| `/api/stripe/capture-payment` | Finaliser + transfert | Admin: Attente → En cours |
| `/api/stripe/get-payment-intent` | Récupérer PaymentIntent | Depuis session_id |
| `/api/stripe/cancel-payment` | Annuler commande | Admin: annulation |

## 🔄 Passage en Production

### Variables à changer :
```bash
# .env
STRIPE_PUBLISHABLE_KEY=pk_live_xxx  # au lieu de pk_test_xxx
STRIPE_SECRET_KEY=sk_live_xxx       # au lieu de sk_test_xxx
```

### Code à modifier :
```javascript
// capture-payment/route.ts
THE_CORNER: 'acct_PRODUCTION_ID'  // au lieu de acct_1RlnwI2QtSgjqCiP

// create-cart-session/route.ts
tax_rates: ["txr_PRODUCTION_ID"]  // au lieu de txr_1RNucECvFAONCF3N6FkHnCwt
success_url: "https://votredomaine.com/checkout/success?session_id={CHECKOUT_SESSION_ID}"
cancel_url: "https://votredomaine.com/checkout/cancel"
```

## 💰 Exemple de Répartition
```
Commande 545€ :
├── 🏪 Reboul (165€)
│   ├── Reçoit : 545€ (paiement total)
│   └── Garde : 165€ (après transfert de 380€)
└── 🏬 The Corner (380€)
    └── Reçoit : 380€ (via transfert Stripe)
```

## 🛡️ Points Critiques
- ✅ **Jamais** de clés live dans le code source
- ✅ **Toujours** vérifier `response.success`
- ✅ **Tester** avec montants réels avant prod
- ✅ **Surveiller** les logs de transfert

## 🚨 Debugging Rapide
```bash
# Tester le système
curl -X POST localhost:3000/api/stripe/test-transfer \
  -d '{"session_id": "cs_xxx"}'

# Vérifier dans Stripe Dashboard
- Payments → Chercher par montant
- Connect > Transfers → Vérifier transferts
- Connect > Accounts → Statut The Corner
```

## 📞 En cas de problème
1. **Dashboard Stripe** : Vérifier statuts
2. **Logs serveur** : Chercher "Stripe Transfer"
3. **Endpoint test** : Diagnostiquer session
4. **Support Stripe** : dashboard.stripe.com/support

---

**🎉 Système prêt ! Un seul paiement, répartition automatique !** 