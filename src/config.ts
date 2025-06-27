/**
 * Configuration globale de l'application Reboul Store
 */

const config = {
  // Configuration Stripe
  stripe: {
    publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "",
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    taxRateId: "txr_1RNucECvFAONCF3N6FkHnCwt", // 20% TVA
  },

  // URLs de l'application
  urls: {
    app: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    api:
      process.env.NEXT_PUBLIC_API_URL ||
      "https://reboul-store-api-production.up.railway.app/api",
  },

  // Configuration API (pour compatibilité avec nodemailer)
  api: {
    baseUrl:
      process.env.NEXT_PUBLIC_API_URL ||
      "https://reboul-store-api-production.up.railway.app/api",
    baseUrlPublic: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },

  // Configuration SMTP pour l'envoi d'emails
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },

  // Paramètres de livraison
  shipping: {
    standardShippingCost: 5.9,
    expressShippingCost: 9.9,
    freeShippingThreshold: 200, // Livraison gratuite à partir de 200€
    allowedCountries: ["FR", "BE", "CH", "LU"],
  },

  // Options d'authentification
  auth: {
    tokenKey: "reboul_auth_token",
    sessionDuration: 30 * 24 * 60 * 60, // 30 jours en secondes
  },

  // Autres paramètres
  site: {
    name: "Reboul Store",
    description: "Votre destination pour les sneakers premium",
    contactEmail: "contact@reboulstore.com",
  },

  // Mode debug (true en développement, false en production)
  debug: process.env.NODE_ENV !== "production",
};

export default config;
