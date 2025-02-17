import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface OrderDetails {
    id: string;
    customerName: string;
    email: string;
    shippingAddress: string;
    items: OrderItem[];
    total: number;
    trackingNumber?: string;
    language?: 'fr' | 'en';
}

interface RecommendedProduct {
    name: string;
    price: number;
    imageUrl: string;
    productUrl: string;
}

const recommendedProducts: RecommendedProduct[] = [
    {
        name: "T-shirt Premium",
        price: 29.99,
        imageUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/images/tshirt-premium.jpg`,
        productUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/produit/tshirt-premium`,
    },
    {
        name: "Jeans Classique",
        price: 59.99,
        imageUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/images/jeans-classique.jpg`,
        productUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/produit/jeans-classique`,
    },
    {
        name: "Chaussures de Sport",
        price: 89.99,
        imageUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/images/chaussures-sport.jpg`,
        productUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/produit/chaussures-sport`,
    },
];

const translations = {
    fr: {
        subject: "Confirmation de votre commande",
        thankYou: "Merci pour votre commande !",
        greeting: "Cher(e)",
        orderConfirmation: "Nous sommes ravis de vous confirmer que votre commande (ID: {orderId}) a été reçue et est en cours de traitement.",
        orderSummary: "Récapitulatif de votre commande :",
        product: "Produit",
        quantity: "Quantité",
        price: "Prix",
        total: "Total",
        nextSteps: "Prochaines étapes :",
        step1: "Nous allons préparer votre commande avec le plus grand soin.",
        step2: "Vous recevrez un e-mail de confirmation d'expédition avec les informations de suivi.",
        step3: "Votre colis sera livré à l'adresse que vous avez fournie lors de la commande.",
        trackingInfo: "Vous pouvez suivre votre commande avec le numéro de suivi suivant :",
        questions: "Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter à l'adresse suivante :",
        thanks: "Merci encore pour votre confiance et votre achat chez Reboul Store !",
        regards: "Cordialement,",
        team: "L'équipe Reboul Store",
        recommendations: "Vous pourriez aussi aimer :",
        promoCode: "Utilisez le code promo MERCI10 pour bénéficier de 10% de réduction sur votre prochaine commande !",
    },
    en: {
        subject: "Order Confirmation",
        thankYou: "Thank you for your order!",
        greeting: "Dear",
        orderConfirmation: "We are pleased to confirm that your order (ID: {orderId}) has been received and is being processed.",
        orderSummary: "Order Summary:",
        product: "Product",
        quantity: "Quantity",
        price: "Price",
        total: "Total",
        nextSteps: "Next Steps:",
        step1: "We will prepare your order with the utmost care.",
        step2: "You will receive a shipping confirmation email with tracking information.",
        step3: "Your package will be delivered to the address you provided during checkout.",
        trackingInfo: "You can track your order with the following tracking number:",
        questions: "If you have any questions about your order, please don't hesitate to contact us at:",
        thanks: "Thank you again for your trust and your purchase from Reboul Store!",
        regards: "Best regards,",
        team: "The Reboul Store Team",
        recommendations: "You might also like:",
        promoCode: "Use promo code THANKS10 to get 10% off your next order!",
    },
};

type TranslationKey = keyof typeof translations;

export async function sendConfirmationEmail(orderDetails: OrderDetails) {
    console.log('SMTP Configuration:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER,
    });

    const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/images/logo_black.png`;
    const lang = (orderDetails.language && orderDetails.language in translations ? orderDetails.language : 'fr') as TranslationKey;
    const t = translations[lang];

    try {
        const info = await transporter.sendMail({
            from: `"Reboul Store" <${process.env.SMTP_USER}>`,
            to: orderDetails.email,
            subject: `${t.subject} ${orderDetails.id}`,
            html: `
        <!DOCTYPE html>
        <html lang="${lang}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${t.subject} ${orderDetails.id}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 20px; text-align: center; background-color: #ffffff;">
                <img src="${logoUrl}" alt="Reboul Store Logo" style="max-width: 200px; height: auto;">
              </td>
            </tr>
            <tr>
              <td style="padding: 20px;">
                <h1 style="color: #4a4a4a; text-align: center; border-bottom: 2px solid #4a4a4a; padding-bottom: 10px;">${t.thankYou}</h1>
                
                <p style="font-size: 16px;">${t.greeting} ${orderDetails.customerName},</p>
                
                <p style="font-size: 16px;">${t.orderConfirmation.replace('{orderId}', orderDetails.id)}</p>
                
                <h2 style="color: #4a4a4a; border-bottom: 1px solid #4a4a4a; padding-bottom: 5px;">${t.orderSummary}</h2>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                  <thead>
                    <tr style="background-color: #f0f0f0;">
                      <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">${t.product}</th>
                      <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">${t.quantity}</th>
                      <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">${t.price}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orderDetails.items.map(item => `
                      <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
                        <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                        <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${(item.price * item.quantity).toFixed(2)} €</td>
                      </tr>
                    `).join('')}
                  </tbody>
                  <tfoot>
                    <tr style="background-color: #f0f0f0;">
                      <td colspan="2" style="padding: 10px; text-align: right; border: 1px solid #ddd;"><strong>${t.total}</strong></td>
                      <td style="padding: 10px; text-align: right; border: 1px solid #ddd;"><strong>${orderDetails.total.toFixed(2)} €</strong></td>
                    </tr>
                  </tfoot>
                </table>
                
                <div style="background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin-top: 20px;">
                  <h3 style="color: #4a4a4a; margin-top: 0;">${t.nextSteps}</h3>
                  <ol style="margin-bottom: 0;">
                    <li>${t.step1}</li>
                    <li>${t.step2}</li>
                    <li>${t.step3}</li>
                  </ol>
                </div>
                
                ${orderDetails.trackingNumber ? `
                  <p style="font-size: 16px; margin-top: 20px;">
                    ${t.trackingInfo} <strong>${orderDetails.trackingNumber}</strong>
                  </p>
                ` : ''}
                
                <p style="font-size: 16px; margin-top: 20px;">${t.questions} <a href="mailto:support@reboulstore.com" style="color: #4a4a4a; text-decoration: none; font-weight: bold;">support@reboulstore.com</a></p>
                
                <p style="font-size: 16px;">${t.thanks}</p>
                
                <div style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
                  <h3 style="color: #4a4a4a;">${t.recommendations}</h3>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      ${recommendedProducts.map(product => `
                        <td style="width: 33.33%; padding: 10px; text-align: center;">
                          <img src="${product.imageUrl}" alt="${product.name}" style="max-width: 100%; height: auto;">
                          <p style="margin: 10px 0 5px;">${product.name}</p>
                          <p style="font-weight: bold;">${product.price.toFixed(2)} €</p>
                          <a href="${product.productUrl}" style="display: inline-block; padding: 5px 10px; background-color: #4a4a4a; color: #ffffff; text-decoration: none; border-radius: 3px;">Voir le produit</a>
                        </td>
                      `).join('')}
                    </tr>
                  </table>
                </div>
                
                <div style="margin-top: 30px; background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center;">
                  <p style="font-size: 18px; font-weight: bold; margin: 0;">${t.promoCode}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background-color: #4a4a4a; color: #ffffff; padding: 20px; text-align: center;">
                <p style="margin: 0;">${t.regards}<br>${t.team}</p>
                <p style="margin-top: 20px;">
                  <a href="https://www.reboulstore.com" style="color: #ffffff; text-decoration: none;">www.reboulstore.com</a> | 
                  <a href="https://www.reboulstore.com/conditions" style="color: #ffffff; text-decoration: none;">Conditions générales de vente</a> | 
                  <a href="https://www.reboulstore.com/confidentialite" style="color: #ffffff; text-decoration: none;">Politique de confidentialité</a>
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
        });

        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

