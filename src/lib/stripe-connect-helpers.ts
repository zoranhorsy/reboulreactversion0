import { Stripe } from 'stripe';

// Configuration des URLs - utiliser directement l'API Railway
const API_URL = 'https://reboul-store-api-production.up.railway.app/api';

// Configuration des comptes Stripe
export const STRIPE_ACCOUNTS = {
  REBOUL: 'main', // Compte principal
  THE_CORNER: 'acct_1RlnwI2QtSgjqCiP', // Compte connecté The Corner
} as const;

// Type pour les magasins
export type StoreType = 'reboul' | 'the_corner';

// Interface pour les éléments du panier avec information du magasin
export interface CartItemWithStore {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant: {
    size: string;
    color: string;
    colorLabel?: string;
    stock: number;
  };
  store: StoreType;
}

// Interface pour les groupes de produits par magasin
export interface ProductsByStore {
  reboul: CartItemWithStore[];
  the_corner: CartItemWithStore[];
}

/**
 * Détermine le magasin d'un produit basé sur son ID
 * @param productId - ID du produit (peut être string ou number)
 * @returns Promise<StoreType> - Type de magasin
 */
export async function getProductStore(productId: string | number): Promise<StoreType> {
  try {
    // Extraire l'ID numérique de l'ID complet (ex: "4-Blanc-XL" -> "4")
    const numericId = typeof productId === 'string' ? 
      productId.split('-')[0] : 
      productId.toString();

    console.log(`[Store Detection] ID original: ${productId}, ID numérique extrait: ${numericId}`);

    // Vérifier d'abord si c'est un produit The Corner via l'API Railway
    const cornerResponse = await fetch(`${API_URL}/corner-products/${numericId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (cornerResponse.ok) {
      console.log(`[Store Detection] Produit ${productId} détecté comme The Corner`);
      return 'the_corner';
    }

    // Sinon, c'est un produit Reboul
    console.log(`[Store Detection] Produit ${productId} détecté comme Reboul`);
    return 'reboul';
  } catch (error) {
    console.error('Erreur lors de la détection du magasin:', error);
    // Par défaut, considérer comme un produit Reboul
    return 'reboul';
  }
}

/**
 * Groupe les articles du panier par magasin
 * @param cartItems - Articles du panier
 * @returns Promise<ProductsByStore> - Produits groupés par magasin
 */
export async function groupProductsByStore(cartItems: any[]): Promise<ProductsByStore> {
  const reboulItems: CartItemWithStore[] = [];
  const cornerItems: CartItemWithStore[] = [];

  for (const item of cartItems) {
    const store = await getProductStore(item.id);
    const itemWithStore: CartItemWithStore = {
      ...item,
      store,
    };

    if (store === 'reboul') {
      reboulItems.push(itemWithStore);
    } else {
      cornerItems.push(itemWithStore);
    }
  }

  return {
    reboul: reboulItems,
    the_corner: cornerItems,
  };
}

/**
 * Calcule le total d'un groupe de produits
 * @param items - Articles du panier
 * @returns number - Total en euros
 */
export function calculateGroupTotal(items: CartItemWithStore[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Valide et corrige l'URL d'une image
 * @param imageUrl - URL de l'image
 * @returns string - URL valide ou placeholder
 */
function validateImageUrl(imageUrl: string | undefined): string[] {
  if (!imageUrl) return [];
  
  // Si c'est déjà une URL absolue, la retourner
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return [imageUrl];
  }
  
  // Si c'est une URL relative, la convertir en absolue
  if (imageUrl.startsWith('/')) {
    return [`https://reboul.com${imageUrl}`];
  }
  
  // Sinon, ne pas inclure d'image
  return [];
}

/**
 * Crée les paramètres de session Stripe pour un magasin spécifique
 * @param items - Articles du magasin
 * @param store - Type de magasin
 * @param baseParams - Paramètres de base de la session
 * @returns object - Paramètres de session Stripe
 */
export function createStripeSessionParams(
  items: CartItemWithStore[],
  store: StoreType,
  baseParams: any
): any {
  const lineItems = items.map(item => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.name,
        description: `${item.variant.color} - ${item.variant.size}`,
        images: validateImageUrl(item.image), // Utiliser la fonction de validation
      },
      unit_amount: Math.round(item.price * 100), // Convertir en centimes
    },
    quantity: item.quantity,
  }));

  const sessionParams = {
    ...baseParams,
    line_items: lineItems,
    metadata: {
      ...baseParams.metadata,
      store,
      item_count: items.length,
      total_amount: calculateGroupTotal(items),
    },
  };

  // Ajouter les paramètres de transfert pour The Corner
  if (store === 'the_corner') {
    sessionParams.payment_intent_data = {
      transfer_data: {
        destination: STRIPE_ACCOUNTS.THE_CORNER,
      },
    };
  }

  return sessionParams;
}

/**
 * Génère un numéro de commande avec préfixe magasin
 * @param store - Type de magasin
 * @returns string - Numéro de commande
 */
export function generateOrderNumber(store: StoreType): string {
  const timestamp = Date.now();
  const prefix = store === 'reboul' ? 'REB' : 'TCR';
  return `${prefix}-${timestamp}`;
}

/**
 * Formate les informations de magasin pour l'affichage
 * @param store - Type de magasin
 * @returns object - Informations formatées
 */
export function getStoreDisplayInfo(store: StoreType) {
  const storeInfo = {
    reboul: {
      name: 'Reboul',
      displayName: 'Reboul',
      color: '#000000',
    },
    the_corner: {
      name: 'The Corner',
      displayName: 'The Corner CP Company',
      color: '#1a73e8',
    },
  };

  return storeInfo[store];
}

export default {
  STRIPE_ACCOUNTS,
  getProductStore,
  groupProductsByStore,
  calculateGroupTotal,
  createStripeSessionParams,
  generateOrderNumber,
  getStoreDisplayInfo,
}; 