import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Configuration de la base de données PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

interface StockUpdateItem {
  product_id: string;
  variant_info?: {
    size?: string;
    color?: string;
  };
  quantity: number;
}

/**
 * Endpoint pour décrémenter le stock des produits
 * POST /api/products/update-stock
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("[Stock Update] === DÉBUT DE LA REQUÊTE ===");
  
  try {
    const body = await request.json();
    const { items, order_id } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items est requis et doit être un tableau non vide" },
        { status: 400 }
      );
    }

    console.log(`[Stock Update] Mise à jour du stock pour ${items.length} articles de la commande #${order_id}`);

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const updateResults = [];
      const errors = [];

      for (const item of items as StockUpdateItem[]) {
        try {
          console.log(`[Stock Update] Traitement de l'article:`, {
            product_id: item.product_id,
            variant: item.variant_info,
            quantity: item.quantity
          });

          // Récupérer le produit avec ses variants JSON
          const productQuery = `
            SELECT id, name, variants 
            FROM products 
            WHERE id = $1 
            FOR UPDATE
          `;
          
          const productResult = await client.query(productQuery, [item.product_id]);

          if (productResult.rows.length === 0) {
            const error = `Produit ${item.product_id} non trouvé`;
            console.error(`[Stock Update] ❌ ${error}`);
            errors.push(error);
            continue;
          }

          const product = productResult.rows[0];
          console.log(`[Stock Update] Produit trouvé: ${product.name} (${product.id})`);
          
          if (!product.variants || !Array.isArray(product.variants)) {
            const error = `Produit ${item.product_id} n'a pas de variants`;
            console.error(`[Stock Update] ❌ ${error}`);
            errors.push(error);
            continue;
          }

          // Trouver le variant correspondant
          const variantIndex = product.variants.findIndex((v: any) => 
            String(v.size) === String(item.variant_info?.size) && 
            String(v.color).toLowerCase() === String(item.variant_info?.color).toLowerCase()
          );

          if (variantIndex === -1) {
            const error = `Variant non trouvé pour le produit ${item.product_id} (taille: ${item.variant_info?.size}, couleur: ${item.variant_info?.color})`;
            console.warn(`[Stock Update] ⚠️ ${error}`);
            console.log(`[Stock Update] Variants disponibles:`, product.variants);
            errors.push(error);
            continue;
          }

          const variant = product.variants[variantIndex];
          console.log(`[Stock Update] ✅ Variant trouvé:`, variant);

          const currentStock = variant.stock;
          const newStock = currentStock - item.quantity;

          if (newStock < 0) {
            const error = `Stock insuffisant pour le produit ${item.product_id} (stock actuel: ${currentStock}, demandé: ${item.quantity})`;
            console.error(`[Stock Update] ❌ ${error}`);
            errors.push(error);
            continue;
          }

          // Mettre à jour le stock du variant
          const updatedVariants = [...product.variants];
          updatedVariants[variantIndex] = {
            ...variant,
            stock: newStock
          };

          // Mettre à jour les variants dans la base de données
          const updateQuery = `
            UPDATE products 
            SET variants = $1
            WHERE id = $2
            RETURNING id
          `;

          const updateResult = await client.query(updateQuery, [
            JSON.stringify(updatedVariants),
            item.product_id
          ]);
          
          if (updateResult.rows.length > 0) {
            const variantId = `${item.product_id}-${item.variant_info?.size}-${item.variant_info?.color}`;
              
            console.log(`[Stock Update] ✅ Stock mis à jour pour variant ${variantId}: ${currentStock} → ${newStock}`);
            
            updateResults.push({
              product_id: item.product_id,
              variant_id: variantId,
              old_stock: currentStock,
              new_stock: newStock,
              quantity_removed: item.quantity
            });
          }

        } catch (itemError) {
          const error = `Erreur lors de la mise à jour du stock pour le produit ${item.product_id}: ${itemError instanceof Error ? itemError.message : 'Erreur inconnue'}`;
          console.error(`[Stock Update] ❌ ${error}`);
          errors.push(error);
        }
      }

      if (errors.length > 0 && updateResults.length === 0) {
        // Si toutes les mises à jour ont échoué, rollback
        await client.query('ROLLBACK');
        return NextResponse.json(
          { 
            error: "Aucune mise à jour de stock n'a pu être effectuée",
            details: errors
          },
          { status: 400 }
        );
      }

      // Commit les changements
      await client.query('COMMIT');
      
      console.log(`[Stock Update] ✅ Transaction terminée avec succès. ${updateResults.length} mises à jour effectuées.`);
      
      return NextResponse.json({
        success: true,
        updated_items: updateResults,
        errors: errors.length > 0 ? errors : undefined,
        summary: {
          total_items: items.length,
          successful_updates: updateResults.length,
          failed_updates: errors.length
        }
      });

    } catch (transactionError) {
      await client.query('ROLLBACK');
      throw transactionError;
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error("[Stock Update] ❌ Erreur lors de la mise à jour du stock:", error);
    
    return NextResponse.json(
      {
        error: "Erreur lors de la mise à jour du stock",
        details: error.message,
      },
      { status: 500 }
    );
  }
} 