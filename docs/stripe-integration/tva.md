# Gestion de la TVA dans Stripe (Reboul)

## 1. Taux de TVA utilisé

| Taux           | ID Stripe                              | Description        |
|----------------|----------------------------------------|--------------------|
| Standard (20%) | txr_1RNucECvFAONCF3N6FkHnCwt           | TVA Standard (20%) |

## 2. Application automatique dans le code

### Stripe Checkout (panier) & Payment Link
- Dans les endpoints d'API (`src/app/api/checkout/create-cart-session/route.ts` et `src/app/api/stripe-links/create-payment-link/route.ts`) :
  - Le taux de TVA appliqué est toujours 20%.
  - Le mapping contient uniquement l'ID Stripe du taux standard.
  - La fonction `getTaxRateId` retourne toujours ce taux.
  - Chaque `line_item` de la session Stripe reçoit le champ `tax_rates: [TAX_RATE_ID]`.

## 3. Pourquoi ce choix ?
- En France, la majorité des produits sont soumis à 20% de TVA.
- Reboul ne vend pas de produits à taux réduit.
- Si un jour des exceptions apparaissent, il suffira d'adapter la fonction et le mapping.

## 4. Où trouver l'ID ?
- L'ID Stripe est visible dans le dashboard Stripe > Product catalogue > Tax rates.
- Si un nouveau taux est créé, il suffit de l'ajouter au code.

## 5. Bonnes pratiques
- Vérifier que l'ID Stripe du taux 20% est à jour dans le code.
- Tester la création de session Checkout et Payment Link pour s'assurer que la TVA est bien appliquée.

---

Pour toute question ou évolution, contacter l'équipe technique Reboul. 