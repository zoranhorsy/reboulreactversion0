import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les promotion codes actifs
    const promoCodes = await stripe.promotionCodes.list({
      active: true,
      limit: 100,
    });
    // Pour chaque promotion code, enrichir avec les infos du coupon
    const promos = await Promise.all(
      promoCodes.data.map(async (promo) => {
        let coupon = null;
        if (promo.coupon && typeof promo.coupon === "object") {
          coupon = promo.coupon;
        } else if (promo.coupon && typeof promo.coupon === "string") {
          coupon = await stripe.coupons.retrieve(promo.coupon);
        }
        return {
          id: promo.id,
          code: promo.code,
          couponId:
            typeof promo.coupon === "string" ? promo.coupon : coupon?.id,
          percent_off: coupon?.percent_off || null,
          amount_off: coupon?.amount_off ? coupon.amount_off / 100 : null,
          currency: coupon?.currency || "eur",
          duration: coupon?.duration,
          max_redemptions: promo.max_redemptions,
          times_redeemed: promo.times_redeemed,
          expires_at: promo.expires_at ? promo.expires_at * 1000 : null,
          restrictions: promo.restrictions,
        };
      }),
    );
    return NextResponse.json({ promos });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des codes promos",
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
