import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Configuration de la base de données PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

interface ReservationItem {
  product_id: string;
  variant_info?: {
    size?: string;
    color?: string;
  };
  quantity: number;
}

/**
 * Endpoint pour réserver temporairement le stock des produits
 * POST /api/products/reserve-stock
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("[Stock Reservation] === DÉBUT DE LA REQUÊTE ===");
  
  try {
    const body = await request.json();
    const { items, order_id, reservation_duration_hours = 24 } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items est requis et doit être un tableau non vide" },
        { status: 400 }
      );
    }

    if (!order_id) {
      return NextResponse.json(
        { error: "order_id est requis" },
        { status: 400 }
      );
    }

    console.log(`[Stock Reservation] Réservation de stock pour ${items.length} articles de la commande #${order_id}`);

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const reservationResults = [];
      const errors = [];
      const expirationTime = new Date(Date.now() + (reservation_duration_hours * 60 * 60 * 1000));

      for (const item of items as ReservationItem[]) {
        try {
          console.log(`[Stock Reservation] Traitement de l'article:`, {
            product_id: item.product_id,
            variant: item.variant_info,
            quantity: item.quantity
          });

          // Chercher le variant correspondant
          const variantQuery = `
            SELECT id, stock 
            FROM product_variants 
            WHERE product_id = $1 
            AND size = $2 
            AND color = $3
          `;
          
          const variantResult = await client.query(variantQuery, [
            item.product_id,
            item.variant_info?.size || '',
            item.variant_info?.color || ''
          ]);

          if (variantResult.rows.length === 0) {
            const error = `Variant non trouvé pour le produit ${item.product_id} (taille: ${item.variant_info?.size}, couleur: ${item.variant_info?.color})`;
            console.warn(`[Stock Reservation] ⚠️ ${error}`);
            errors.push(error);
            continue;
          }

          const variant = variantResult.rows[0];
          const currentStock = variant.stock;

          // Vérifier les réservations existantes pour ce variant
          const existingReservationsQuery = `
            SELECT COALESCE(SUM(quantity), 0) as reserved_quantity
            FROM stock_reservations 
            WHERE variant_id = $1 
            AND expires_at > NOW() 
            AND status = 'active'
          `;

          const reservationsResult = await client.query(existingReservationsQuery, [variant.id]);
          const reservedQuantity = parseInt(reservationsResult.rows[0].reserved_quantity) || 0;
          const availableStock = currentStock - reservedQuantity;

          if (availableStock < item.quantity) {
            const error = `Stock insuffisant pour le produit ${item.product_id} (stock total: ${currentStock}, réservé: ${reservedQuantity}, disponible: ${availableStock}, demandé: ${item.quantity})`;
            console.error(`[Stock Reservation] ❌ ${error}`);
            errors.push(error);
            continue;
          }

          // Créer la réservation
          const reservationQuery = `
            INSERT INTO stock_reservations (
              order_id, variant_id, product_id, quantity, expires_at, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, 'active', NOW())
            RETURNING id, expires_at
          `;

          const reservationResult = await client.query(reservationQuery, [
            order_id,
            variant.id,
            item.product_id,
            item.quantity,
            expirationTime
          ]);
          
          if (reservationResult.rows.length > 0) {
            const reservation = reservationResult.rows[0];
            console.log(`[Stock Reservation] ✅ Réservation créée:`, {
              reservation_id: reservation.id,
              variant_id: variant.id,
              quantity: item.quantity,
              expires_at: reservation.expires_at
            });
            
            reservationResults.push({
              product_id: item.product_id,
              variant_id: variant.id,
              reservation_id: reservation.id,
              quantity_reserved: item.quantity,
              expires_at: reservation.expires_at,
              available_stock_before: availableStock,
              available_stock_after: availableStock - item.quantity
            });
          }

        } catch (itemError) {
          const error = `Erreur lors de la réservation pour le produit ${item.product_id}: ${itemError instanceof Error ? itemError.message : 'Erreur inconnue'}`;
          console.error(`[Stock Reservation] ❌ ${error}`);
          errors.push(error);
        }
      }

      if (errors.length > 0 && reservationResults.length === 0) {
        // Si toutes les réservations ont échoué, rollback
        await client.query('ROLLBACK');
        return NextResponse.json(
          { 
            error: "Aucune réservation n'a pu être effectuée",
            details: errors
          },
          { status: 400 }
        );
      }

      // Commit les changements
      await client.query('COMMIT');
      
      console.log(`[Stock Reservation] ✅ Transaction terminée avec succès. ${reservationResults.length} réservations créées.`);
      
      return NextResponse.json({
        success: true,
        reservations: reservationResults,
        errors: errors.length > 0 ? errors : undefined,
        expires_at: expirationTime,
        summary: {
          total_items: items.length,
          successful_reservations: reservationResults.length,
          failed_reservations: errors.length
        }
      });

    } catch (transactionError) {
      await client.query('ROLLBACK');
      throw transactionError;
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error("[Stock Reservation] ❌ Erreur lors de la réservation:", error);
    
    return NextResponse.json(
      {
        error: "Erreur lors de la réservation du stock",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Endpoint pour libérer les réservations de stock
 * DELETE /api/products/reserve-stock
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  console.log("[Stock Reservation Release] === DÉBUT DE LA REQUÊTE ===");
  
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json(
        { error: "order_id est requis" },
        { status: 400 }
      );
    }

    console.log(`[Stock Reservation Release] Libération des réservations pour la commande #${orderId}`);

    const client = await pool.connect();
    
    try {
      // Marquer les réservations comme libérées
      const releaseQuery = `
        UPDATE stock_reservations 
        SET status = 'released', updated_at = NOW()
        WHERE order_id = $1 AND status = 'active'
        RETURNING id, variant_id, quantity
      `;

      const result = await client.query(releaseQuery, [orderId]);
      
      console.log(`[Stock Reservation Release] ✅ ${result.rows.length} réservations libérées pour la commande #${orderId}`);
      
      return NextResponse.json({
        success: true,
        released_reservations: result.rows.length,
        reservations: result.rows
      });

    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error("[Stock Reservation Release] ❌ Erreur lors de la libération:", error);
    
    return NextResponse.json(
      {
        error: "Erreur lors de la libération des réservations",
        details: error.message,
      },
      { status: 500 }
    );
  }
} 