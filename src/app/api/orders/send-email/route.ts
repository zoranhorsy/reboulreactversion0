import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface OrderEmailData {
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    variant_info?: {
      size?: string;
      color?: string;
    };
  }>;
  type: 'pending' | 'confirmed' | 'cancelled';
}

// Templates d'emails
const generateEmailTemplate = (data: OrderEmailData) => {
  const baseStyles = `
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9f9f9; }
      .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
      .logo { font-size: 24px; font-weight: bold; color: #000; }
      .order-info { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
      .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
      .items-table th { background-color: #f8f9fa; font-weight: bold; }
      .total { font-size: 18px; font-weight: bold; color: #000; text-align: right; margin-top: 20px; }
      .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px; }
      .status-pending { color: #856404; background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; }
      .status-confirmed { color: #155724; background-color: #d4edda; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745; }
      .status-cancelled { color: #721c24; background-color: #f8d7da; padding: 15px; border-radius: 6px; border-left: 4px solid #dc3545; }
    </style>
  `;

  const itemsHtml = data.items.map(item => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return `
    <tr>
      <td>${item.product_name}</td>
      <td>
        ${item.variant_info?.size ? `Taille: ${item.variant_info.size}` : ''}
        ${item.variant_info?.color ? `<br>Couleur: ${item.variant_info.color}` : ''}
      </td>
      <td>${item.quantity}</td>
      <td>${price.toFixed(2)}€</td>
      <td>${(price * item.quantity).toFixed(2)}€</td>
    </tr>
    `;
  }).join('');

  let statusSection = '';
  let subject = '';

  switch (data.type) {
    case 'pending':
      subject = `Commande reçue #${data.order_number} - En attente de validation`;
      statusSection = `
        <div class="status-pending">
          <h3>🕐 Commande en attente de validation</h3>
          <p>Votre commande a été reçue avec succès et est en cours de traitement. Nous vérifions actuellement la disponibilité de vos articles en magasin.</p>
          <p><strong>Important :</strong> Votre carte bancaire a été autorisée mais <strong>ne sera débitée qu'après validation</strong> de la disponibilité de vos articles.</p>
          <p>Vous recevrez un email de confirmation dès que votre commande sera validée et préparée.</p>
        </div>
      `;
      break;

    case 'confirmed':
      subject = `Commande confirmée #${data.order_number} - Paiement effectué`;
      statusSection = `
        <div class="status-confirmed">
          <h3>✅ Commande confirmée et payée</h3>
          <p>Excellente nouvelle ! Tous vos articles sont disponibles en magasin.</p>
          <p><strong>Votre paiement a été confirmé</strong> et votre commande est maintenant en cours de préparation.</p>
          <p>Vous recevrez bientôt un email avec le numéro de suivi dès l'expédition de votre colis.</p>
        </div>
      `;
      break;

    case 'cancelled':
      subject = `Commande annulée #${data.order_number} - Aucun débit effectué`;
      statusSection = `
        <div class="status-cancelled">
          <h3>❌ Commande annulée</h3>
          <p>Nous sommes désolés de vous informer que votre commande ne peut pas être honorée car certains articles ne sont pas disponibles en magasin.</p>
          <p><strong>Aucun débit n'a été effectué</strong> sur votre carte bancaire. L'autorisation préalable sera automatiquement libérée par votre banque sous 2-3 jours ouvrés.</p>
          <p>Nous vous invitons à consulter notre site pour découvrir d'autres articles similaires.</p>
        </div>
      `;
      break;
  }

  return {
    subject,
    html: `
      ${baseStyles}
      <div class="container">
        <div class="header">
          <div class="logo">REBOUL STORE</div>
          <p>Votre boutique de mode à Marseille</p>
        </div>

        <h2>Bonjour ${data.customer_name},</h2>

        ${statusSection}

        <div class="order-info">
          <h3>📦 Détails de votre commande</h3>
          <p><strong>Numéro de commande :</strong> #${data.order_number}</p>
          <p><strong>Total :</strong> ${(typeof data.total_amount === 'string' ? parseFloat(data.total_amount) : data.total_amount).toFixed(2)}€</p>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Article</th>
              <th>Variante</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total">
          Total de la commande : ${(typeof data.total_amount === 'string' ? parseFloat(data.total_amount) : data.total_amount).toFixed(2)}€
        </div>

        <div class="footer">
          <p>📍 <strong>REBOUL STORE</strong></p>
          <p>Votre boutique de mode à Marseille</p>
          <p>Pour toute question, contactez-nous par email</p>
          <p>Merci de votre confiance !</p>
        </div>
      </div>
    `
  };
};

/**
 * Endpoint pour envoyer les emails de notification de commande
 * POST /api/orders/send-email
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("[Order Email] === DÉBUT DE LA REQUÊTE ===");
  
  try {
    const body = await request.json();
    const emailData: OrderEmailData = body;

    if (!emailData.customer_email || !emailData.order_number || !emailData.type) {
      return NextResponse.json(
        { error: "customer_email, order_number et type sont requis" },
        { status: 400 }
      );
    }

    console.log(`[Order Email] Envoi d'email ${emailData.type} pour commande #${emailData.order_number} à ${emailData.customer_email}`);

    // Générer le template d'email
    const emailTemplate = generateEmailTemplate(emailData);

    // Envoyer l'email
    const mailOptions = {
      from: `"Reboul Store" <${process.env.SMTP_USER}>`,
      to: emailData.customer_email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`[Order Email] ✅ Email envoyé avec succès:`, {
      messageId: info.messageId,
      to: emailData.customer_email,
      type: emailData.type
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      type: emailData.type,
      recipient: emailData.customer_email,
    });

  } catch (error: any) {
    console.error("[Order Email] ❌ Erreur lors de l'envoi de l'email:", error);
    
    return NextResponse.json(
      {
        error: "Erreur lors de l'envoi de l'email",
        details: error.message,
      },
      { status: 500 }
    );
  }
} 