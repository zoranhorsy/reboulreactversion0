# Composants UI - Projet Reboul

Ce document détaille les composants UI spécifiques utilisés dans l'application Reboul, leur apparence et leur utilisation.

## Composants principaux

### Composants de variantes produit (Août 2024)

#### ColorSelector
```tsx
// Nouveau composant ColorSelector optimisé
export function ColorSelector({
  colors,
  variants,
  selectedColor,
  selectedSize,
  onColorChange,
  productImages = {}
}: ColorSelectorProps) {
  // Vérifie si une couleur est disponible pour la taille sélectionnée
  const isColorAvailable = (color: string) => {
    if (!selectedSize) return true
    
    return variants.some(variant => 
      variant.color === color && 
      variant.size === selectedSize && 
      variant.stock > 0
    )
  }

  return (
    <div className="mb-6 relative">
      <h3 className="text-sm font-medium mb-3">
        Couleur: {selectedColor ? getColorInfo(selectedColor).label : ''}
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {colors.map(color => {
          const colorInfo = getColorInfo(color);
          const available = isColorAvailable(color);
          
          return (
            <Button
              key={color}
              variant={selectedColor === color ? "default" : "outline"}
              onClick={() => onColorChange(color)}
              disabled={!available}
              className={cn(
                "h-9 px-3",
                !available && "opacity-50"
              )}
            >
              {colorInfo.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
```

#### SizeSelector
```tsx
// Composant SizeSelector amélioré
export function SizeSelector({ 
  selectedSize, 
  onSizeChange,
  variants = [],
  selectedColor = "",
  sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL']
}: SizeSelectorProps) {
  // Vérifier si une taille est disponible pour la couleur sélectionnée
  const isSizeAvailable = (size: string) => {
    if (!selectedColor) return true
    
    return variants.some(variant => 
      variant.size === size && 
      variant.color === selectedColor && 
      variant.stock > 0
    )
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map(size => {
        const available = isSizeAvailable(size);
        
        return (
          <Button
            key={size}
            variant={selectedSize === size ? "default" : "outline"}
            onClick={() => onSizeChange(size)}
            disabled={!available}
            className={cn(
              "h-9 px-3",
              !available && "opacity-50"
            )}
          >
            {size}
          </Button>
        )
      })}
    </div>
  )
}
```

### Interface de produit

#### ProductDetails
```tsx
// Section des détails du produit avec support des thèmes
<div className="flex flex-col">
  {/* En-tête produit */}
  <div className="mb-6">
    {product.brand && (
      <div className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
        {product.brand}
      </div>
    )}
    <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
      {product.name}
    </h1>
    <div className="flex items-center gap-4 mt-2">
      <div className="text-2xl font-bold">
        {formatPrice(product.price)}
      </div>
      {oldPrice && (
        <div className="text-sm text-muted-foreground line-through">
          {formatPrice(oldPrice)}
        </div>
      )}
    </div>
    
    <div className="flex items-center justify-between mt-3">
      <div className="flex items-center gap-2">
        {currentVariantStock > 0 ? (
          <div className="flex items-center text-sm">
            <span>Plus que {currentVariantStock} en stock !</span>
          </div>
        ) : (
          <div className="flex items-center text-sm text-destructive">
            <span>Rupture de stock</span>
          </div>
        )}
      </div>
    </div>
  </div>
</div>
```

#### Bouton d'ajout au panier avec support thème
```tsx
<Button
  size="lg"
  className={cn(
    "w-full",
    "bg-black hover:bg-zinc-800 text-white",
    "dark:bg-zinc-100 dark:text-black dark:hover:bg-white"
  )}
  onClick={onAddToCart}
  disabled={!isInStock || !selectedSize || !selectedColor}
>
  <ShoppingBag className="h-5 w-5 mr-2" />
  Ajouter au panier
</Button>
```

### Loader optimisé
```tsx
// Ancien loader (supprimé)
<div className="flex-1 flex flex-col items-center justify-center min-h-screen">
  <ReboulSpinner size="lg" />
  <p className="mt-4 text-muted-foreground">Chargement en cours...</p>
</div>

// Nouveau loader léger
<div className="flex items-center justify-center min-h-screen">
  <div className="animate-pulse text-zinc-400">Chargement...</div>
</div>
```

## Système de thème

Tous les composants UI ont été mis à jour pour supporter les thèmes clair et sombre. Nous utilisons une approche basée sur les classes conditionnelles avec TailwindCSS:

```tsx
// Exemple de composant avec support du thème
<Card className={cn(
  "p-4 rounded-lg", 
  "bg-white border border-zinc-200 shadow-sm",
  "dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none",
  "transition-colors duration-200"
)}>
  <CardHeader>
    <CardTitle className="text-gray-900 dark:text-white">Titre</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-zinc-600 dark:text-zinc-400">
      Contenu avec support du thème
    </p>
  </CardContent>
</Card>
```

## Directives de style

1. Toujours utiliser les utilitaires `cn()` pour combiner les classes conditionnelles
2. Préférer les composants UI réutilisables aux styles inline
3. Utiliser les classes Tailwind sémantiques (ex: `text-primary` vs `text-blue-500`)
4. Ajouter systématiquement les variantes dark pour tous les éléments visibles
5. Respecter la hiérarchie visuelle (titres, texte, éléments interactifs)
6. Maintenir une densité d'interface cohérente entre les pages

## Composants de base

### Boutons
- **Button Primaire**: Fond bleu (`#1E40AF`), texte blanc, coins arrondis (8px), padding horizontal plus important
- **Button Secondaire**: Contour bleu (`#1E40AF`), texte bleu, fond transparent
- **Button Tertiaire**: Texte bleu (`#1E40AF`), sans fond ni bordure
- **Button Danger**: Fond rouge (`#EF4444`), texte blanc
- **Button Success**: Fond vert (`#10B981`), texte blanc
- **Loading Button**: Inclut un spinner pendant le chargement

```jsx
<Button variant="primary" size="md">Ajouter au panier</Button>
<Button variant="secondary" size="sm">Voir plus</Button>
<Button variant="tertiary">Annuler</Button>
```

### Inputs
- **Text Input**: Champ de texte avec bordure grise, focus bleu
- **Search Input**: Avec icône de recherche intégrée
- **Textarea**: Pour les commentaires et notes
- **Checkbox**: Style personnalisé avec animation à la sélection
- **Radio**: Style personnalisé avec cercle intérieur animé
- **Select**: Menu déroulant avec flèche personnalisée

```jsx
<Input placeholder="Votre email" type="email" />
<SearchInput placeholder="Rechercher un produit" />
<Textarea placeholder="Laissez un commentaire" rows={4} />
```

### Cartes
- **ProductCard**: Carte de produit avec image, nom, prix et bouton d'action
- **CategoryCard**: Carte de catégorie avec image de fond et titre superposé
- **InfoCard**: Carte informative pour la page d'accueil
- **TestimonialCard**: Carte pour les avis clients

```jsx
<ProductCard 
  product={{ 
    name: "Nike Air Max 90", 
    price: 149.99, 
    image: "/images/products/airmax90.jpg" 
  }} 
/>
```

## Composants de navigation

### Navigation
- **Navbar**: Barre de navigation principale avec logo, liens, recherche et icônes
- **MobileMenu**: Menu hamburger pour mobile
- **Breadcrumbs**: Fil d'Ariane pour la navigation hiérarchique
- **Pagination**: Navigation entre les pages de résultats
- **Tabs**: Onglets pour basculer entre différentes sections

```jsx
<Navbar />
<Breadcrumbs items={[
  { label: "Accueil", href: "/" },
  { label: "Chaussures", href: "/catalogue/chaussures" },
  { label: "Nike", href: "/catalogue/chaussures/nike" }
]} />
```

### Sidebars
- **FilterSidebar**: Barre latérale pour les filtres du catalogue
- **AccountSidebar**: Navigation du compte utilisateur
- **AdminSidebar**: Navigation de l'interface admin

## Composants spécifiques

### E-commerce
- **PriceTag**: Affichage des prix avec gestion des promotions
- **QuantitySelector**: Sélecteur de quantité avec boutons + et -
- **ColorPicker**: Sélecteur de couleur avec pastilles
- **SizePicker**: Sélecteur de taille avec boutons
- **ProductGallery**: Galerie d'images de produit avec zoom et navigation
- **WishlistButton**: Bouton d'ajout aux favoris (cœur)
- **AddToCartButton**: Bouton d'ajout au panier avec animation

```jsx
<PriceTag price={149.99} discountPrice={129.99} />
<QuantitySelector value={2} onChange={(value) => console.log(value)} />
<SizePicker 
  sizes={["S", "M", "L", "XL"]} 
  selectedSize="M" 
  onChange={(size) => console.log(size)} 
/>
```

### Feedback
- **Toast**: Notification temporaire pour les actions réussies/échouées
- **Alert**: Message d'alerte persistant
- **Modal**: Fenêtre modale pour les actions importantes
- **Drawer**: Panneau latéral coulissant (panier, filtres sur mobile)
- **LoadingSpinner**: Indicateur de chargement
- **ProgressBar**: Barre de progression (checkout, téléchargement)

```jsx
<Toast message="Produit ajouté au panier" type="success" />
<Alert title="Rupture de stock" message="Ce produit n'est plus disponible" type="error" />
<Modal title="Confirmer la commande" isOpen={isOpen} onClose={onClose}>
  <p>Êtes-vous sûr de vouloir passer cette commande ?</p>
  <Button>Confirmer</Button>
</Modal>
```

## Thème et variants

### Thème clair/sombre
- Tous les composants supportent le thème clair et sombre
- Transition fluide entre les thèmes
- Détection automatique des préférences système

### Variantes de taille
- **xs**: Très petit (icônes, boutons d'action)
- **sm**: Petit (interfaces denses, mobiles)
- **md**: Moyen (taille par défaut)
- **lg**: Grand (éléments mis en avant)
- **xl**: Très grand (titres, héros)

### États des composants
- **Default**: État normal
- **Hover**: Au survol
- **Focus**: Lorsque focalisé
- **Active**: Pendant l'interaction (clic)
- **Disabled**: Désactivé
- **Loading**: En cours de chargement 