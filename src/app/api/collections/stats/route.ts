import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import axios from "axios"

export const dynamic = 'force-dynamic'

// Définir les interfaces pour les types
interface ProductApiResponse {
  data: Product[];
  // Autres champs potentiels de la réponse
}

interface Product {
  id: string;
  name: string;
  store_type?: string;
  new?: boolean;
  deleted?: boolean;
  _actiontype?: string;
  // Autres champs d'un produit
}

interface StoreTypeStats {
  total: number;
  new: number;
}

interface StatsResult {
  [storeType: string]: StoreTypeStats;
}

/**
 * API endpoint pour récupérer les statistiques des collections
 * Retourne le nombre total de produits et le nombre de nouveautés par store_type
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Début du calcul des statistiques pour les collections...');
    
    // Requête pour récupérer TOUS les produits depuis l'API Railway
    const API_URL = 'https://reboul-store-api-production.up.railway.app/api';
    
    // Récupérer plusieurs pages de produits pour obtenir un comptage précis
    let allProducts: Product[] = [];
    let page = 1;
    let hasMoreProducts = true;
    const limit = 100; // Maximum par page
    
    while (hasMoreProducts) {
      console.log(`Récupération de la page ${page} de produits...`);
      
      try {
        const response = await axios.get(`${API_URL}/products`, { 
          params: { 
            limit: limit,
            page: page
          }
        });
        
        if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
          throw new Error("Format de réponse API inattendu");
        }
        
        // Ajouter les produits au tableau
        allProducts = [...allProducts, ...response.data.data];
        
        // Vérifier s'il y a une autre page
        if (response.data.data.length < limit) {
          hasMoreProducts = false;
        } else {
          page++;
        }
      } catch (pageError) {
        console.error(`Erreur lors de la récupération de la page ${page}:`, pageError);
        hasMoreProducts = false;
      }
    }
    
    console.log(`Total de ${allProducts.length} produits récupérés.`);
    
    // Filtrer pour exclure les produits supprimés
    const validProducts = allProducts.filter(product => 
      product._actiontype !== "hardDelete" && 
      product._actiontype !== "delete" && 
      product._actiontype !== "permDelete" &&
      product.deleted !== true &&
      product.store_type !== "deleted" &&
      (typeof product.name !== 'string' || !product.name.startsWith('[SUPPRIMÉ]'))
    );
    
    console.log(`${validProducts.length} produits valides après filtrage.`);
    
    // Calculer les statistiques par store_type
    const stats: StatsResult = validProducts.reduce((acc: StatsResult, product: Product) => {
      const storeType = product.store_type || 'other';
      
      if (!acc[storeType]) {
        acc[storeType] = { total: 0, new: 0 };
      }
      
      // Incrémenter le compteur total
      acc[storeType].total += 1;
      
      // Si le produit est marqué comme nouveau, incrémenter le compteur de nouveautés
      if (product.new === true) {
        acc[storeType].new += 1;
      }
      
      return acc;
    }, {});
    
    // S'assurer que toutes les catégories connues sont présentes dans les stats
    const knownTypes = ['adult', 'kids', 'sneakers', 'cpcompany'];
    knownTypes.forEach(type => {
      if (!stats[type]) {
        stats[type] = { total: 0, new: 0 };
      }
    });
    
    console.log('Statistiques RÉELLES calculées:', stats);
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error("Error fetching collection stats:", error);
    
    // En cas d'erreur, retourner des données de démonstration
    // Cela permet au frontend de fonctionner même si le backend n'est pas disponible
    const demoStats: StatsResult = {
      adult: { total: 178, new: 12 },
      kids: { total: 94, new: 8 },
      sneakers: { total: 67, new: 0 },
      cpcompany: { total: 42, new: 0 }
    };
    
    // En mode développement, retourner les données de démo
    if (process.env.NODE_ENV === 'development') {
      console.info("Returning demo data in development mode");
      return NextResponse.json(demoStats);
    }
    
    // En production, renvoyer une erreur
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        details: error instanceof Error ? error.message : "Unknown error",
        demoData: demoStats  // Inclure quand même les données de démo pour faciliter le débogage
      },
      { status: 500 }
    );
  }
} 