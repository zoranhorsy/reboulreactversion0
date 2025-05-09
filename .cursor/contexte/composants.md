# Composants de l'application Reboul E-commerce

Ce fichier décrit les principaux composants de l'application Reboul et leur fonctionnement.

## Composants principaux

### ProductCard
Le composant ProductCard est responsable de l'affichage d'un produit dans les listes et grilles du catalogue.
- Affiche l'image principale, le nom et le prix du produit
- Gère l'affichage des prix barrés pour les promotions
- Bouton d'ajout aux favoris
- Transition au survol avec zoom léger

### ProductDetail
Composant de la page détaillée d'un produit.
- Galerie d'images avec zoom
- Sélecteurs de taille et couleur
- Bouton d'ajout au panier
- Description détaillée et spécifications
- Produits similaires

### CartItem
Représente un article dans le panier.
- Affiche l'image, le nom, le prix et la quantité
- Permet de modifier la quantité ou supprimer l'article
- Calcule le sous-total par article

### CartSummary
Résumé du panier avec totaux.
- Affiche le sous-total, frais de livraison et total
- Bouton de passage à la caisse
- Gestion des codes promotionnels

### Navbar
Barre de navigation principale.
- Logo et liens de navigation
- Barre de recherche
- Icônes de panier et compte utilisateur
- Adaptation mobile avec menu hamburger

### Footer
Pied de page du site.
- Informations de contact
- Liens vers les pages importantes (CGV, politique de confidentialité)
- Newsletter
- Logos des moyens de paiement

### CategoryFilter
Filtres de produits pour le catalogue.
- Filtres par catégorie, marque, taille, couleur
- Filtre de prix avec slider
- Bouton de réinitialisation des filtres

### CheckoutForm
Formulaire de paiement.
- Intégration Stripe pour le paiement par carte
- Formulaires d'adresses de livraison et facturation
- Sélection du mode de livraison

### OrderSummary
Résumé de commande après paiement.
- Détails de la commande
- Statut et numéro de commande
- Instructions de suivi

### AdminProductForm
Interface d'administration pour les produits.
- Formulaire de création/édition de produits
- Upload d'images multiples via Cloudinary
- Gestion des stocks et des variantes 