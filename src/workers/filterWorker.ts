// Types
type FilterMessage = {
  type: 'FILTER_PRODUCTS';
  taskId: string;
  products: Product[];
  options: FilterOptions;
};

type SortMessage = {
  type: 'SORT_PRODUCTS';
  taskId: string;
  products: Product[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

type Product = {
  id: string;
  name: string;
  price: number;
  category_id?: string | number;
  brand_id?: string | number;
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  variants?: Array<{
    size?: string;
    color?: string;
    stock?: number;
  }>;
  [key: string]: any;
};

type FilterOptions = {
  categories?: string[];
  brands?: string[];
  priceRange?: { min: number; max: number };
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  searchTerm?: string;
};

// Variable pour suivre les performances
let startTime = 0;

// Fonction de filtrage
function filterProducts(products: Product[], options: FilterOptions): Product[] {
  return products.filter(product => {
    // Filtre par catégorie
    if (options.categories?.length) {
      const categoryId = String(product.category_id || '');
      if (!options.categories.some(cat => cat === categoryId)) {
        return false;
      }
    }

    // Filtre par marque
    if (options.brands?.length) {
      const brandId = String(product.brand_id || '');
      if (!options.brands.some(brand => brand === brandId)) {
        return false;
      }
    }

    // Filtre par prix
    if (options.priceRange) {
      if (product.price < options.priceRange.min || product.price > options.priceRange.max) {
        return false;
      }
    }

    // Filtre par taille
    if (options.sizes?.length && product.variants) {
      const productSizes = product.variants.map(v => v.size).filter(Boolean) as string[];
      if (!options.sizes.some(size => productSizes.includes(size))) {
        return false;
      }
    }

    // Filtre par couleur
    if (options.colors?.length && product.variants) {
      const productColors = product.variants.map(v => v.color?.toLowerCase()).filter(Boolean) as string[];
      if (!options.colors.some(color => productColors.includes(color.toLowerCase()))) {
        return false;
      }
    }

    // Filtre par disponibilité
    if (options.inStock !== undefined) {
      // Si le produit a des variantes, vérifier si au moins une est en stock
      if (product.variants && product.variants.length > 0) {
        const hasStock = product.variants.some(v => (v.stock || 0) > 0);
        if (options.inStock !== hasStock) return false;
      } else if (options.inStock !== !!product.inStock) {
        return false;
      }
    }

    // Filtre par terme de recherche
    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        (product.brand && product.brand.toLowerCase().includes(searchLower)) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });
}

// Fonction de tri
function sortProducts(products: Product[], sortBy: string, sortOrder: 'asc' | 'desc'): Product[] {
  // Cloner le tableau pour ne pas modifier l'original
  const clonedProducts = [...products];
  const sortFactor = sortOrder === 'asc' ? 1 : -1;

  return clonedProducts.sort((a, b) => {
    if (sortBy === 'price') {
      return (a.price - b.price) * sortFactor;
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name) * sortFactor;
    } else if (sortBy === 'newest') {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return (dateB - dateA); // Toujours du plus récent au plus ancien
    } else if (sortBy === 'popular') {
      const popularityA = a.popularity || 0;
      const popularityB = b.popularity || 0;
      return (popularityB - popularityA); // Toujours du plus populaire au moins populaire
    }
    return 0;
  });
}

// Gestionnaire de messages
self.onmessage = (event: MessageEvent) => {
  const message = event.data;
  startTime = performance.now();

  try {
    switch (message.type) {
      case 'FILTER_PRODUCTS': {
        const result = filterProducts(message.products, message.options);
        const processingTime = performance.now() - startTime;
        
        self.postMessage({
          type: 'FILTER_SUCCESS',
          taskId: message.taskId,
          result,
          processingTime
        });
        break;
      }
      case 'SORT_PRODUCTS': {
        const result = sortProducts(message.products, message.sortBy, message.sortOrder);
        const processingTime = performance.now() - startTime;
        
        self.postMessage({
          type: 'SORT_SUCCESS',
          taskId: message.taskId,
          result,
          processingTime
        });
        break;
      }
      default:
        self.postMessage({
          type: 'ERROR',
          taskId: message.taskId || 'unknown',
          error: 'Type de message non supporté'
        });
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      taskId: message.taskId || 'unknown',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}; 