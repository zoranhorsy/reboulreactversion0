import { Stripe } from 'stripe';

// Configuration des URLs - utiliser directement l'API Railway
const API_URL = 'https://reboul-store-api-production.up.railway.app/api';

// Configuration des comptes Stripe
export const STRIPE_ACCOUNTS = {
  REBOUL: 'main', // Compte principal
  THE_CORNER: 'acct_1RlnwI2QtSgjqCiP', // Compte connecté The Corner
} as const;

// Type pour les magasins (mis à jour pour la nouvelle architecture)
export type StoreType = 'adult' | 'sneakers' | 'kids' | 'the_corner';

// Interface pour les éléments du panier avec information du magasin
export interface CartItemWithStore {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant: {
    size: string;
    color: string;
    colorLabel: string;
    stock: number;
  };
  storeType: StoreType;
  store: StoreType;
}

// Interface pour les groupes de produits par magasin (architecture complète)
export interface ProductsByStore {
  // Reboul sub-stores
  adult: CartItemWithStore[];
  sneakers: CartItemWithStore[];
  kids: CartItemWithStore[];
  // The Corner (store distinct)
  the_corner: CartItemWithStore[];
}

/**
 * Détermine le magasin d'un produit basé sur son storeType ou ID
 * @param item - Item du panier avec storeType ou productId
 * @returns Promise<StoreType> - Type de magasin
 */
export async function getProductStore(item: any): Promise<StoreType> {
  try {
    // Si l'item a déjà un storeType, l'utiliser directement
    if (item.storeType) {
      console.log(`[Store Detection] StoreType trouvé: ${item.storeType}`);
      return item.storeType;
    }

    // Sinon, utiliser l'API pour détecter le type
    const productId = item.productId || item.id;
    const numericId = typeof productId === 'string' ? 
      productId.split('-')[0] : 
      productId.toString();

    console.log(`[Store Detection] Détection via API pour ID: ${numericId}`);

    // Vérifier d'abord si c'est un produit The Corner
    try {
      const cornerResponse = await fetch(`${API_URL}/corner-products/${numericId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (cornerResponse.ok) {
        console.log(`[Store Detection] Produit ${productId} détecté comme the_corner`);
        return 'the_corner';
      }
    } catch (cornerError) {
      console.warn('Erreur lors de la vérification Corner:', cornerError);
    }

    // Vérifier ensuite les produits Reboul normaux
    try {
      const productResponse = await fetch(`${API_URL}/products/${numericId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (productResponse.ok) {
        const productData = await productResponse.json();
        if (productData && productData.store_type) {
          console.log(`[Store Detection] Store type trouvé: ${productData.store_type}`);
          return productData.store_type;
        }
      }
    } catch (productError) {
      console.warn('Erreur lors de la vérification produit:', productError);
    }

    // Par défaut, retourner adult
    console.log(`[Store Detection] Défaut: adult pour ${productId}`);
    return 'adult';
  } catch (error) {
    console.error('Erreur lors de la détection du magasin:', error);
    return 'adult';
  }
}

/**
 * Groupe les articles du panier par magasin
 * @param cartItems - Articles du panier
 * @returns Promise<ProductsByStore> - Produits groupés par magasin
 */
export async function groupProductsByStore(cartItems: any[]): Promise<ProductsByStore> {
  const adultItems: CartItemWithStore[] = [];
  const sneakersItems: CartItemWithStore[] = [];
  const kidsItems: CartItemWithStore[] = [];
  const theCornerItems: CartItemWithStore[] = [];

  for (const item of cartItems) {
    const store = await getProductStore(item);
    const itemWithStore: CartItemWithStore = {
      ...item,
      store,
      storeType: store, // S'assurer que storeType est défini
    };

    if (store === 'adult') {
      adultItems.push(itemWithStore);
    } else if (store === 'sneakers') {
      sneakersItems.push(itemWithStore);
    } else if (store === 'kids') {
      kidsItems.push(itemWithStore);
    } else if (store === 'the_corner') {
      theCornerItems.push(itemWithStore);
    }
  }

  return {
    adult: adultItems,
    sneakers: sneakersItems,
    kids: kidsItems,
    the_corner: theCornerItems,
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

  // Ajouter les paramètres de transfert pour CP Company (anciennement The Corner)
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
  const prefixMap = {
    adult: 'ADT',
    sneakers: 'SNK',
    kids: 'KDS',
    the_corner: 'TCR'
  };
  const prefix = prefixMap[store] || 'UNK';
  return `${prefix}-${timestamp}`;
}

/**
 * Formate les informations de magasin pour l'affichage
 * @param store - Type de magasin
 * @returns object - Informations formatées
 */
export function getStoreDisplayInfo(store: StoreType) {
  const storeInfo = {
    adult: {
      name: 'Reboul Adult',
      displayName: 'Reboul Adult',
      color: '#000000',
    },
    sneakers: {
      name: 'Sneakers',
      displayName: 'Reboul Sneakers',
      color: '#FF6B35',
    },
    kids: {
      name: 'Kids',
      displayName: 'Reboul Kids',
      color: '#4CAF50',
    },
    the_corner: {
      name: 'The Corner',
      displayName: 'The Corner',
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